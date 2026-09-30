'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { formatCurrency, formatDateTimeBR, maskCPF, formatPhone } from '@/lib/formatters';
import { useStore } from '@/lib/store-context';
import { Printer, Download, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ order, isOpen, onClose }: ReceiptModalProps) {
  const { settings } = useStore();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#B08968]/30 overflow-hidden my-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F5EBDD] border-b border-[#B08968]/20 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#5C4033]" />
            <h3 className="font-semibold text-[#5C4033] text-lg">Comprovante & Recibo da Venda</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5C4033] hover:bg-[#432d23] text-white text-sm font-medium rounded-lg shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir Recibo
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-black/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 md:p-8 bg-white print:p-0 print-receipt-container font-sans text-sm text-[#5C4033]">
          {/* Logo & Header */}
          <div className="text-center pb-6 border-b border-dashed border-[#B08968]/40">
            <div className="inline-block mb-2 font-serif text-2xl font-bold tracking-wide text-[#5C4033]">
              {settings.name.toUpperCase()}
            </div>
            <p className="text-xs text-[#B08968] font-medium">{settings.tagline}</p>
            <p className="text-xs text-gray-600 mt-1">
              WhatsApp: {formatPhone(settings.whatsapp)} | {settings.email}
            </p>
            <p className="text-xs text-gray-500">{settings.address}</p>
          </div>

          {/* Sale Identification */}
          <div className="py-4 border-b border-dashed border-[#B08968]/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-[#5C4033]">PEDIDO / RECIBO:</span>{' '}
              <span className="font-mono text-sm font-bold text-[#C49A45]">{order.id}</span>
            </div>
            <div>
              <span className="font-bold text-[#5C4033]">DATA/HORA:</span>{' '}
              <span>{formatDateTimeBR(order.date)}</span>
            </div>
            <div>
              <span className="font-bold text-[#5C4033]">STATUS:</span>{' '}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F5EBDD] text-[#5C4033]">
                {order.status}
              </span>
            </div>
            {order.isOpenSale && (
              <div className="w-full mt-1 p-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded text-center font-medium">
                ⚠️ Venda Registrada em Aberto (Orçamento / Produção em Andamento)
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="py-4 border-b border-dashed border-[#B08968]/40 text-xs space-y-1">
            <div className="font-bold text-[#5C4033] mb-1">DADOS DO CLIENTE</div>
            <div>
              <span className="text-gray-500">Nome:</span> <span className="font-semibold">{order.client.name}</span>
            </div>
            {order.client.cpf && (
              <div>
                <span className="text-gray-500">CPF:</span> <span>{maskCPF(order.client.cpf)}</span>
              </div>
            )}
            {order.client.whatsapp && (
              <div>
                <span className="text-gray-500">WhatsApp:</span> <span>{formatPhone(order.client.whatsapp)}</span>
              </div>
            )}
            {order.client.email && (
              <div>
                <span className="text-gray-500">E-mail:</span> <span>{order.client.email}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Entrega:</span>{' '}
              <span className="font-medium capitalize">{order.shippingMethod}</span>
              {order.client.address && (
                <span className="text-gray-600 block mt-0.5">
                  {order.client.address.street}, {order.client.address.number}
                  {order.client.address.complement ? ` (${order.client.address.complement})` : ''} -{' '}
                  {order.client.address.neighborhood}, {order.client.address.city}/{order.client.address.state} - CEP:{' '}
                  {order.client.address.zipCode}
                </span>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4 border-b border-dashed border-[#B08968]/40">
            <div className="font-bold text-[#5C4033] text-xs mb-2">ITENS DO PEDIDO & PERSONALIZAÇÕES</div>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={item.id || idx} className="text-xs bg-[#FFFDF9] p-3 rounded-lg border border-[#F5EBDD]">
                  <div className="flex justify-between items-start font-semibold text-[#5C4033]">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                  {item.barcode && (
                    <div className="text-[11px] text-gray-400 font-mono">Cód: {item.barcode}</div>
                  )}

                  {/* Customizations details */}
                  {item.customizations && (
                    <div className="mt-1.5 pl-2 border-l-2 border-[#C49A45] space-y-0.5 text-[11px] text-gray-600">
                      {item.customizations.format && (
                        <div>• Formato: <strong>{item.customizations.format}</strong></div>
                      )}
                      {item.customizations.paperType && (
                        <div>• Papel/Gramatura: <strong>{item.customizations.paperType}</strong></div>
                      )}
                      {item.customizations.finish && (
                        <div>• Acabamento: <strong>{item.customizations.finish}</strong></div>
                      )}
                      {item.customizations.lamination && (
                        <div>• Laminação: <strong>{item.customizations.lamination}</strong></div>
                      )}
                      {item.customizations.specialCut && (
                        <div>• Corte Especial: <strong>{item.customizations.specialCut}</strong></div>
                      )}
                      {item.customizations.accessories && (
                        <div>• Acessórios/Laço: <strong>{item.customizations.accessories}</strong></div>
                      )}
                      {item.customizations.theme && (
                        <div>• Tema/Paleta: <strong>{item.customizations.theme}</strong></div>
                      )}
                      {item.customizations.customText && (
                        <div className="text-[#5C4033] font-medium">
                          • Gravação: "{item.customizations.customText}"
                        </div>
                      )}
                      {item.customizations.notes && (
                        <div className="italic text-gray-500">• Obs: {item.customizations.notes}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Payment */}
          <div className="py-4 border-b border-dashed border-[#B08968]/40 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal dos Itens:</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountValue > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Desconto ({order.couponCode || 'Cupom'}):</span>
                <span>- {formatCurrency(order.discountValue)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Frete / Entrega:</span>
              <span>{order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'Grátis (Retirada)'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#5C4033] pt-2 border-t border-gray-200">
              <span>TOTAL DO RECIBO:</span>
              <span className="text-[#C49A45]">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 pt-1">
              <span>Forma de Pagamento:</span>
              <span className="font-semibold">{order.paymentMethod} ({order.paymentStatus})</span>
            </div>
          </div>

          {/* Internal Notes or Tracking */}
          {order.trackingCode && (
            <div className="py-2 text-xs text-gray-600 border-b border-dashed border-[#B08968]/40">
              <strong>Código de Rastreamento:</strong> {order.trackingCode}
            </div>
          )}

          {/* Fiscal document reference if issued */}
          {order.fiscalDocument && order.fiscalDocument.status === 'Emitida' && (
            <div className="py-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded mt-2 border border-emerald-200">
              ✓ Documento Fiscal {order.fiscalDocument.type} nº {order.fiscalDocument.number} emitido com sucesso.
              <br />
              Chave SEFAZ: <span className="font-mono text-[10px]">{order.fiscalDocument.key}</span>
            </div>
          )}

          {/* Footer Receipt Notice */}
          <div className="pt-6 text-center text-xs text-gray-500 space-y-1">
            <p className="font-serif italic text-[#B08968]">"Obrigado por escolher a Recriar Papelaria Personalizada!"</p>
            <p className="text-[11px]">Cada peça é produzida artesanalmente com dedicação e afeto.</p>
            <p className="text-[10px] text-gray-400">Comprovante de Venda e Produção Gerado em {new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
