import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const type = searchParams.get('type') || 'xml';

  const db = getDatabase();
  const order = db.orders.find((o) => o.id === orderId);

  if (!order || !order.fiscalDocument) {
    return new NextResponse('Documento fiscal não encontrado para este pedido.', { status: 404 });
  }

  const doc = order.fiscalDocument;

  if (type === 'xml') {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${doc.key}" versao="4.00">
      <ide>
        <cUF>21</cUF>
        <cNF>12345678</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>${doc.type === 'NFC-e' ? '65' : '55'}</mod>
        <serie>1</serie>
        <nNF>${doc.number}</nNF>
        <dhEmi>${doc.issuedAt}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
      </ide>
      <emit>
        <CNPJ>${db.settings.fiscalSettings.cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${db.settings.fiscalSettings.razaoSocial}</xNome>
        <xFant>${db.settings.fiscalSettings.nomeFantasia}</xFant>
      </emit>
      <dest>
        <xNome>${order.client.name}</xNome>
        ${order.client.cpf ? `<CPF>${order.client.cpf.replace(/\D/g, '')}</CPF>` : ''}
      </dest>
      <total>
        <ICMSTot>
          <vProd>${order.subtotal.toFixed(2)}</vProd>
          <vNF>${order.total.toFixed(2)}</vNF>
          <vDesc>${order.discountValue.toFixed(2)}</vDesc>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>${db.settings.fiscalSettings.environment === 'producao' ? '1' : '2'}</tpAmb>
      <verAplic>RecriarFiscal_v1.0</verAplic>
      <chNFe>${doc.key}</chNFe>
      <dhRecbto>${doc.issuedAt}</dhRecbto>
      <nProt>${doc.protocol}</nProt>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${doc.type}-${doc.number}.xml"`,
      },
    });
  }

  // DANFE preview view
  const danfeHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>DANFE - ${doc.type} Nº ${doc.number}</title>
  <style>
    body { font-family: monospace, sans-serif; font-size: 11px; margin: 20px; line-height: 1.3; }
    .box { border: 1px solid #000; padding: 6px; margin-bottom: 6px; }
    .header { text-align: center; }
    .title { font-weight: bold; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 5px; }
    th, td { border: 1px solid #999; padding: 4px; text-align: left; }
    th { background: #eee; }
    .btn-print { margin-bottom: 15px; padding: 8px 16px; background: #5C4033; color: white; border: none; cursor: pointer; border-radius: 4px; }
    @media print { .btn-print { display: none; } }
  </style>
</head>
<body>
  <button class="btn-print" onclick="window.print()">Imprimir DANFE / Salvar PDF</button>
  <div class="box header">
    <div class="title">${db.settings.fiscalSettings.nomeFantasia}</div>
    <div>${db.settings.fiscalSettings.razaoSocial} - CNPJ: ${db.settings.fiscalSettings.cnpj}</div>
    <div>Inscrição Estadual: ${db.settings.fiscalSettings.inscricaoEstadual}</div>
    <div><strong>DOCUMENTO AUXILIAR DA NOTA FISCAL DE CONSUMIDOR ELETRÔNICA (${doc.type})</strong></div>
    <div>Nº: ${doc.number} - Série: 1 - Emissão: ${new Date(doc.issuedAt || '').toLocaleString('pt-BR')}</div>
    <div>Protocolo de Autorização: ${doc.protocol}</div>
    <div>Chave de Acesso: ${doc.key}</div>
  </div>

  <div class="box">
    <strong>DESTINATÁRIO:</strong> ${order.client.name}<br>
    <strong>CPF:</strong> ${order.client.cpf ? order.client.cpf : 'Não informado'}<br>
    <strong>ENDEREÇO:</strong> ${order.client.address ? `${order.client.address.street}, ${order.client.address.number} - ${order.client.address.neighborhood}, ${order.client.address.city}/${order.client.address.state}` : 'Retirada no Ateliê'}
  </div>

  <div class="box">
    <strong>ITENS DO PEDIDO:</strong>
    <table>
      <thead>
        <tr>
          <th>Item / Descrição</th>
          <th>Qtd</th>
          <th>Vl. Unit</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (i) => `<tr>
            <td>${i.productName}</td>
            <td>${i.quantity}</td>
            <td>R$ ${i.unitPrice.toFixed(2)}</td>
            <td>R$ ${(i.quantity * i.unitPrice).toFixed(2)}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="box" style="text-align: right;">
    <div>Subtotal: R$ ${order.subtotal.toFixed(2)}</div>
    <div>Desconto: R$ ${order.discountValue.toFixed(2)}</div>
    <div>Frete: R$ ${order.shippingFee.toFixed(2)}</div>
    <div><strong>TOTAL A PAGAR: R$ ${order.total.toFixed(2)}</strong></div>
    <div>Forma de Pagamento: ${order.paymentMethod}</div>
  </div>

  <div class="box" style="text-align: center; font-size: 10px;">
    EMITIDA EM AMBIENTE DE ${db.settings.fiscalSettings.environment.toUpperCase()} PELO PROVEDOR ${db.settings.fiscalSettings.provider}<br>
    Consulta via leitor de QR Code ou chave no portal estadual da SEFAZ
  </div>
</body>
</html>`;

  return new NextResponse(danfeHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
