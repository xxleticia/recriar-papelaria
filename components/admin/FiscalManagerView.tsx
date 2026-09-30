'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { FiscalSettings } from '@/lib/types';
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Building,
  Key,
  Download,
  Printer,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

export function FiscalManagerView() {
  const { settings, orders, adminUpdateSettings } = useStore();
  const fiscal = settings.fiscalSettings;

  const [provider, setProvider] = useState(fiscal.provider || 'Focus NFe');
  const [environment, setEnvironment] = useState<'homologacao' | 'producao'>(fiscal.environment || 'homologacao');
  const [defaultDocType, setDefaultDocType] = useState<'NFC-e' | 'NF-e' | 'NFS-e'>(fiscal.defaultDocType || 'NFC-e');
  const [cnpj, setCnpj] = useState(fiscal.cnpj || '');
  const [razaoSocial, setRazaoSocial] = useState(fiscal.razaoSocial || '');
  const [nomeFantasia, setNomeFantasia] = useState(fiscal.nomeFantasia || '');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(fiscal.inscricaoEstadual || '');
  const [regimeTributario, setRegimeTributario] = useState(fiscal.regimeTributario || 'Simples Nacional');
  const [apiKey, setApiKey] = useState(fiscal.apiKey || '');

  const [testResult, setTestResult] = useState<{ connected: boolean; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-connection' }),
      });
      const data = await res.json();
      setTestResult({
        connected: !!data.connected,
        text: data.statusText || data.details || 'Resultado da consulta',
      });
    } catch {
      setTestResult({ connected: false, text: 'Falha ao testar conexão com o provedor fiscal.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveFiscal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: FiscalSettings = {
      ...fiscal,
      provider: provider as any,
      environment,
      defaultDocType,
      cnpj,
      razaoSocial,
      nomeFantasia,
      inscricaoEstadual,
      regimeTributario: regimeTributario as any,
      apiKey,
      certificateConfigured: apiKey.length > 10,
    };

    await adminUpdateSettings({ fiscalSettings: updated });
    setIsSaving(false);
    alert('Configurações fiscais salvas com sucesso!');
  };

  // Orders with fiscal status
  const ordersWithFiscal = orders.filter((o) => o.fiscalDocument);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-[#C49A45]" />
            <span>Módulo Fiscal Homologado (NFC-e / NF-e / NFS-e)</span>
          </h2>
          <p className="text-xs text-gray-500">
            Integração com provedor autorizado da SEFAZ para emissão jurídica e armazenamento de protocolos e XMLs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!fiscal.apiKey ? (
            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Integração Pendente de Configuração</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Ambiente: {fiscal.environment.toUpperCase()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid: Config Form & Real Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSaveFiscal} className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-4 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#C49A45]" />
              <span>Dados Cadastrais do Emissor</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">CNPJ da Empresa</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Inscrição Estadual (IE)</label>
                <input
                  type="text"
                  value={inscricaoEstadual}
                  onChange={(e) => setInscricaoEstadual(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Razão Social</label>
                <input
                  type="text"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Regime Tributário</label>
                <select
                  value={regimeTributario}
                  onChange={(e) => setRegimeTributario(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="Simples Nacional">Simples Nacional</option>
                  <option value="MEI">MEI (Microempreendedor Individual)</option>
                  <option value="Lucro Presumido">Lucro Presumido</option>
                </select>
              </div>
            </div>

            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 pt-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#C49A45]" />
              <span>Provedor Fiscal Homologado</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Provedor Homologado</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="Focus NFe">Focus NFe</option>
                  <option value="Nuvem Fiscal">Nuvem Fiscal</option>
                  <option value="Webmania">Webmania</option>
                  <option value="eNotas">eNotas</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Ambiente</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="homologacao">Homologação (Testes SEFAZ)</option>
                  <option value="producao">Produção (Validade Jurídica)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Documento Padrão</label>
                <select
                  value={defaultDocType}
                  onChange={(e) => setDefaultDocType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="NFC-e">NFC-e (Consumidor Final)</option>
                  <option value="NF-e">NF-e (Mercadorias Modelo 55)</option>
                  <option value="NFS-e">NFS-e (Serviços de Criação)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold mb-1">Token de API do Provedor</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Insira a chave de API fornecida pelo seu emissor..."
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Consultando...' : 'Testar Conexão com SEFAZ'}</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-xl shadow-md transition"
              >
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>

          {testResult && (
            <div
              className={`p-4 rounded-2xl text-xs space-y-1 ${
                testResult.connected
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {testResult.connected ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>Resultado do Teste:</span>
              </div>
              <p>{testResult.text}</p>
            </div>
          )}
        </div>

        {/* Right Info: 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Explanation */}
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C49A45]" />
              <span>Conformidade & Validade Jurídica</span>
            </h3>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <strong>Regra de Transparência Fiscal:</strong>
              <p className="text-[11px] leading-relaxed">
                Este sistema não gera simulações fictícias apresentadas como notas fiscais reais. Para emitir documentos com validade jurídica, é obrigatório cadastrar o Token do emissor e certificado digital A1.
              </p>
            </div>

            <div className="space-y-2 text-gray-600 text-[11px]">
              <div>• <strong>NFC-e:</strong> Indicada para vendas no balcão e consumidor final pessoa física.</div>
              <div>• <strong>NF-e:</strong> Indicada para envios interestaduais via Correios/transportadora e vendas PJ.</div>
              <div>• <strong>NFS-e:</strong> Utilizada caso a empresa tribute sob criação de arte e design gráfico no município.</div>
            </div>
          </div>

          {/* Recently Issued Documents */}
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2">
              Documentos Emitidos Recentemente
            </h3>

            {ordersWithFiscal.length === 0 ? (
              <p className="text-gray-400 py-4 text-center">Nenhum documento fiscal emitido ainda.</p>
            ) : (
              <div className="space-y-2">
                {ordersWithFiscal.map((o) => (
                  <div key={o.id} className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#5C4033]">
                        {o.fiscalDocument?.type} nº {o.fiscalDocument?.number}
                      </div>
                      <span className="text-[10px] text-gray-500">
                        Pedido: {o.id} • Protocolo: {o.fiscalDocument?.protocol}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <a
                        href={o.fiscalDocument?.xmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-white border rounded text-[10px] font-bold text-gray-700 hover:bg-gray-100"
                      >
                        XML
                      </a>
                      <a
                        href={o.fiscalDocument?.danfeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-[#5C4033] text-white rounded text-[10px] font-bold hover:bg-[#432d23]"
                      >
                        DANFE
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
