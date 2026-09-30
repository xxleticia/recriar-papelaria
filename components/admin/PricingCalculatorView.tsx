'use client';

import React, { useState, useMemo } from 'react';
import { calculatePricing, PricingCalculationInput } from '@/lib/pricing';
import { formatCurrency } from '@/lib/formatters';
import { useStore } from '@/lib/store-context';
import {
  Calculator,
  BookOpen,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Save,
  Layers,
  Percent,
  Clock,
  Package,
} from 'lucide-react';

export function PricingCalculatorView() {
  const { products, adminAddProduct } = useStore();

  // Inputs
  const [custoPapelEMateriais, setCustoPapelEMateriais] = useState<number>(25.0);
  const [percentualPerdas, setPercentualPerdas] = useState<number>(10.0);
  const [horasTrabalhadas, setHorasTrabalhadas] = useState<number>(1.0);
  const [valorHora, setValorHora] = useState<number>(30.0);
  const [impressao, setImpressao] = useState<number>(8.0);
  const [acabamentos, setAcabamentos] = useState<number>(4.0);
  const [embalagem, setEmbalagem] = useState<number>(3.5);
  const [terceirizacao, setTerceirizacao] = useState<number>(0.0);
  const [freteRateado, setFreteRateado] = useState<number>(2.0);
  const [custosFixosRateados, setCustosFixosRateados] = useState<number>(3.5);

  const [margemLucro, setMargemLucro] = useState<number>(40.0);
  const [impostos, setImpostos] = useState<number>(6.0);
  const [taxaCartao, setTaxaCartao] = useState<number>(4.0);
  const [comissao, setComissao] = useState<number>(0.0);

  const [quantidadeProduzida, setQuantidadeProduzida] = useState<number>(1);
  const [descontoMaximoPermitido, setDescontoMaximoPermitido] = useState<number>(10.0);

  // Manual selling price override check
  const [manualPriceOverride, setManualPriceOverride] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'calculadora' | 'manual'>('calculadora');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Total percentage taxes
  const taxasPercentuaisTotais = impostos + taxaCartao + comissao;

  // Run exact formula
  const result = useMemo(() => {
    return calculatePricing({
      custoMateriais: custoPapelEMateriais,
      percentualPerdas,
      horasTrabalhadas,
      valorHora,
      impressao,
      acabamentos,
      embalagem,
      terceirizacao,
      freteRateado,
      custosFixosRateados,
      margemLucro,
      taxasPercentuaisTotais,
      quantidadeProduzida,
      descontoMaximoPermitido,
    });
  }, [
    custoPapelEMateriais,
    percentualPerdas,
    horasTrabalhadas,
    valorHora,
    impressao,
    acabamentos,
    embalagem,
    terceirizacao,
    freteRateado,
    custosFixosRateados,
    margemLucro,
    taxasPercentuaisTotais,
    quantidadeProduzida,
    descontoMaximoPermitido,
  ]);

  // Check manual price alert
  const manualPriceNum = parseFloat(manualPriceOverride);
  const isBelowCost =
    !isNaN(manualPriceNum) && manualPriceNum < result.precoMinimoRecomendadoUnitario;
  const isBelowTargetMargin =
    !isNaN(manualPriceNum) && manualPriceNum < result.precoFinalUnitario && !isBelowCost;

  // Save composition as product
  const handleSaveAsProduct = async () => {
    const prodName = prompt('Digite o nome do produto para salvar com este preço:');
    if (!prodName) return;

    await adminAddProduct({
      name: prodName,
      price: result.precoFinalUnitario,
      minQuantity: Math.max(1, quantidadeProduzida),
      estimatedDays: 5,
      costComposition: {
        custoMateriais: custoPapelEMateriais,
        perdasPercent: percentualPerdas,
        horasTrabalhadas,
        valorHora,
        impressao,
        acabamentos,
        embalagem,
        terceirizacao,
        freteRateado,
        custosFixosRateados,
        margemLucroPercent: margemLucro,
        taxasPercentTotais: taxasPercentuaisTotais,
        precoFinalSugerido: result.precoFinalUnitario,
      },
      priceTiers: result.tierEstimates.map((t) => ({
        minQty: t.quantity,
        unitPrice: t.unitPrice,
      })),
    });

    setSaveSuccessMsg(`Produto "${prodName}" salvo com sucesso com preço sugerido de ${formatCurrency(result.precoFinalUnitario)}!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#C49A45]" />
            <span>Calculadora de Precificação & Manual do Ateliê</span>
          </h2>
          <p className="text-xs text-gray-500">
            Fórmulas transparentes de precificação com margem real, rateio de mão de obra e proteção contra prejuízos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calculadora')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'calculadora'
                ? 'bg-[#5C4033] text-white shadow-xs'
                : 'bg-[#F5EBDD] text-[#5C4033] hover:bg-[#ebdcc9]'
            }`}
          >
            Calculadora
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'manual'
                ? 'bg-[#5C4033] text-white shadow-xs'
                : 'bg-[#F5EBDD] text-[#5C4033] hover:bg-[#ebdcc9]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#C49A45]" />
            <span>Manual Passo a Passo</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {activeTab === 'manual' ? (
        /* Manual Step-by-Step Guide requested by user: "coloque o manual como calcular a precificação" */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#B08968]/30 shadow-xs space-y-6 text-[#5C4033]">
          <div className="border-b border-[#F5EBDD] pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EBDD] text-[#5C4033] text-xs font-bold mb-2">
              <BookOpen className="w-4 h-4 text-[#C49A45]" />
              <span>Manual Oficial Recriar</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#5C4033]">
              Como Calcular Corretamente o Preço de Venda na Papelaria Personalizada
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Guia prático definitivo para nunca mais pagar para trabalhar e lucrar com segurança em cada encomenda.
            </p>
          </div>

          {/* Step 1 */}
          <div className="space-y-2 p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD]">
            <h4 className="font-bold text-sm text-[#5C4033] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5C4033] text-white flex items-center justify-center text-xs">1</span>
              Materiais com Margem de Perda e Desperdício
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Na papelaria personalizada, papel encavala na impressora, a laminação dá bolha e cortes na guilhotina ou plotter podem errar.
              Portanto, <strong>nunca calcule apenas o material exato</strong>.
            </p>
            <div className="p-3 bg-[#F5EBDD]/60 rounded-xl font-mono text-xs text-[#5C4033]">
              materiais_com_perdas = custo_dos_materiais * (1 + percentual_de_perdas / 100)
            </div>
            <p className="text-[11px] text-gray-500 italic">
              Exemplo: Papéis e insumos custaram R$ 20,00. Com 10% de perda prevista: R$ 20,00 * 1,10 = R$ 22,00.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2 p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD]">
            <h4 className="font-bold text-sm text-[#5C4033] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5C4033] text-white flex items-center justify-center text-xs">2</span>
              Mão de Obra e Valor da Sua Hora de Trabalho
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              O seu trabalho artesanal (criação da arte no Corel/Canva/Illustrator, impressão, laminação, vinco, encadernação e laço)
              <strong> tem valor e deve ser remunerado</strong> como custo direto da peça.
            </p>
            <div className="p-3 bg-[#F5EBDD]/60 rounded-xl font-mono text-xs text-[#5C4033]">
              mao_de_obra = horas_trabalhadas * valor_da_hora
            </div>
            <p className="text-[11px] text-gray-500 italic">
              Exemplo: Para um salário desejado de R$ 3.000/mês trabalhando 160h, seu valor/hora é ~R$ 18,75 a R$ 30,00. Se gastou 1h no pedido: Mão de obra = R$ 30,00.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2 p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD]">
            <h4 className="font-bold text-sm text-[#5C4033] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5C4033] text-white flex items-center justify-center text-xs">3</span>
              Custo Base Completo do Lote
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Some todos os custos diretos e indiretos necessários para que o produto fique pronto e embalado.
            </p>
            <div className="p-3 bg-[#F5EBDD]/60 rounded-xl font-mono text-xs text-[#5C4033] overflow-x-auto">
              custo_base = materiais_com_perdas + impressao + acabamentos + embalagem + terceirizacao + frete_rateado + mao_de_obra + custos_fixos_rateados
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2 p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD]">
            <h4 className="font-bold text-sm text-[#5C4033] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5C4033] text-white flex items-center justify-center text-xs">4</span>
              O Grande Erro do Mercado: Markup vs. Divisão de Margem
            </h4>
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs space-y-1">
              <strong>❌ O Erro que leva à falência:</strong> Multiplicar Custo * 1,40 (pensando que tem 40% de margem). Na verdade, ao dar 10% de desconto ou pagar taxa de cartão de 10%, sua margem cai drasticamente ou vira prejuízo!
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs space-y-1">
              <strong>✓ A Fórmula Correta (Margem Real sobre o Preço de Venda):</strong>
              <div className="font-mono text-xs py-1">preco_sem_taxas = custo_base / (1 - margem_de_lucro / 100)</div>
              Se você deseja 40% de margem sobre a venda, divide o custo por 0,60 (1 - 0,40).
            </div>
          </div>

          {/* Step 5 */}
          <div className="space-y-2 p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD]">
            <h4 className="font-bold text-sm text-[#5C4033] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5C4033] text-white flex items-center justify-center text-xs">5</span>
              Aplicação das Taxas Totais (Impostos + Taxa de Cartão + Comissão)
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              As taxas incidem sobre o preço total final cobrado do cliente. Portanto, aplicamos a dedução correta:
            </p>
            <div className="p-3 bg-[#F5EBDD]/60 rounded-xl font-mono text-xs text-[#5C4033]">
              preco_final = preco_sem_taxas / (1 - taxas_percentuais_totais / 100)
            </div>
            <p className="text-[11px] text-amber-800 font-semibold">
              ⚠️ Se a soma das taxas for igual ou superior a 100%, a operação torna-se matematicamente inviável e o sistema bloqueia o cálculo para proteger seu negócio.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('calculadora')}
              className="px-6 py-2.5 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Ir para a Calculadora Interativa →
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Calculator Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section: 7 cols */}
          <div className="lg:col-span-7 space-y-5">
            {/* Box 1: Materiais e Mão de Obra */}
            <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C49A45]" />
                <span>1. Materiais & Mão de Obra</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Custo dos Papéis/Insumos (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={custoPapelEMateriais}
                    onChange={(e) => setCustoPapelEMateriais(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Perdas / Desperdício (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="50"
                    value={percentualPerdas}
                    onChange={(e) => setPercentualPerdas(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Horas Trabalhadas</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    value={horasTrabalhadas}
                    onChange={(e) => setHorasTrabalhadas(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Valor da Sua Hora (R$/h)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={valorHora}
                    onChange={(e) => setValorHora(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Qtd Produzida no Lote</label>
                  <input
                    type="number"
                    min="1"
                    value={quantidadeProduzida}
                    onChange={(e) => setQuantidadeProduzida(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-[#5C4033]"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Impressão, Acabamentos e Custos Fixos */}
            <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C49A45]" />
                <span>2. Impressão, Acabamentos & Rateios</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Custo de Impressão (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={impressao}
                    onChange={(e) => setImpressao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Acabamentos / Wire-o (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={acabamentos}
                    onChange={(e) => setAcabamentos(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Embalagem & Laços (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={embalagem}
                    onChange={(e) => setEmbalagem(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Terceirização (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={terceirizacao}
                    onChange={(e) => setTerceirizacao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Frete dos Materiais (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={freteRateado}
                    onChange={(e) => setFreteRateado(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Custos Fixos Rateados (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={custosFixosRateados}
                    onChange={(e) => setCustosFixosRateados(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Box 3: Margem de Lucro e Taxas Percentuais */}
            <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#C49A45]" />
                <span>3. Margem de Lucro & Taxas Tributárias</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Margem de Lucro (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="95"
                    value={margemLucro}
                    onChange={(e) => setMargemLucro(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Impostos (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={impostos}
                    onChange={(e) => setImpostos(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Taxa do Meio Pagto (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={taxaCartao}
                    onChange={(e) => setTaxaCartao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Comissão Vendas (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={comissao}
                    onChange={(e) => setComissao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>
                  Soma total de taxas incidentes: <strong>{taxasPercentuaisTotais.toFixed(1)}%</strong>
                </span>
                {taxasPercentuaisTotais >= 100 && (
                  <span className="text-red-600 font-bold">⚠️ Taxas não podem atingir 100%!</span>
                )}
              </div>
            </div>
          </div>

          {/* Results Column: 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            {!result.isValid ? (
              <div className="p-5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs space-y-2">
                <AlertTriangle className="w-5 h-5" />
                <div className="font-bold">Cálculo Bloqueado</div>
                <p>{result.errorMessage}</p>
              </div>
            ) : (
              <>
                {/* Result Hero Card */}
                <div className="bg-gradient-to-br from-[#5C4033] to-[#432d23] text-white p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-[#F5EBDD]/80 font-medium uppercase tracking-wider block">
                        Preço Sugerido por Unidade
                      </span>
                      <div className="font-serif text-3xl sm:text-4xl font-bold text-[#FFFDF9] mt-1">
                        {formatCurrency(result.precoFinalUnitario)}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#C49A45] text-white text-xs font-bold shadow-xs">
                      Margem {result.margemEfetivaPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-white/60 block text-[11px]">Total do Lote ({quantidadeProduzida} un):</span>
                      <span className="font-bold text-sm text-[#F5EBDD]">
                        {formatCurrency(result.precoFinalLote)}
                      </span>
                    </div>

                    <div>
                      <span className="text-white/60 block text-[11px]">Lucro Líquido no Lote:</span>
                      <span className="font-bold text-sm text-emerald-400">
                        +{formatCurrency(result.lucroReaisLote)}
                      </span>
                    </div>

                    <div>
                      <span className="text-white/60 block text-[11px]">Custo Base Unitário:</span>
                      <span className="font-semibold text-white/90">
                        {formatCurrency(result.custoBaseUnitario)}
                      </span>
                    </div>

                    <div>
                      <span className="text-white/60 block text-[11px]">Preço Mínimo (Zero Lucro):</span>
                      <span className="font-semibold text-amber-300">
                        {formatCurrency(result.precoMinimoRecomendadoUnitario)}
                      </span>
                    </div>
                  </div>

                  {/* Save As Product CTA */}
                  <button
                    onClick={handleSaveAsProduct}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#C49A45] hover:bg-[#b58b38] text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Composição como Novo Produto</span>
                  </button>
                </div>

                {/* Manual Price Override Simulator & Warnings */}
                <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-2 text-xs">
                  <label className="block font-bold text-[#5C4033]">
                    Simular Preço Manual de Venda:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.50"
                      value={manualPriceOverride}
                      onChange={(e) => setManualPriceOverride(e.target.value)}
                      placeholder={`Sugerido: ${result.precoFinalUnitario.toFixed(2)}`}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl"
                    />
                    {manualPriceOverride && (
                      <button
                        type="button"
                        onClick={() => setManualPriceOverride('')}
                        className="text-xs text-gray-500 hover:text-gray-800"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {isBelowCost && (
                    <div className="p-2.5 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        <strong>ALERTA DE PREJUÍZO!</strong> O preço de R$ {manualPriceNum.toFixed(2)} está abaixo do
                        custo mínimo de R$ {result.precoMinimoRecomendadoUnitario.toFixed(2)}. Você pagará para produzir!
                      </span>
                    </div>
                  )}

                  {isBelowTargetMargin && (
                    <div className="p-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Atenção: Este preço está abaixo da margem de lucro desejada ({margemLucro}%).
                      </span>
                    </div>
                  )}
                </div>

                {/* Bulk Price Tiers Table */}
                <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-2 text-xs">
                  <div className="font-bold text-[#5C4033] flex items-center justify-between border-b pb-1.5">
                    <span>Faixas de Preço por Quantidade (Escala)</span>
                    <span className="text-[10px] text-gray-400">Diluição de Setup</span>
                  </div>

                  <div className="space-y-1.5">
                    {result.tierEstimates.map((tier, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#FFFDF9] border border-[#F5EBDD]"
                      >
                        <span className="font-semibold text-gray-800">{tier.quantity} unidades</span>
                        <div className="text-right">
                          <span className="font-bold text-[#C49A45]">{formatCurrency(tier.unitPrice)}/un</span>
                          <span className="text-[10px] text-gray-400 block">
                            Total: {formatCurrency(tier.totalPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Break-even Point & Discount Impact */}
                <div className="p-4 bg-[#F5EBDD]/60 rounded-2xl border border-[#B08968]/30 space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span>Ponto de Equilíbrio do Lote:</span>
                    <strong className="text-[#5C4033]">{result.pontoEquilibrioUnidades} unidades</strong>
                  </div>
                  {result.descontoImpacto && (
                    <div className="flex justify-between pt-1 border-t border-[#B08968]/20">
                      <span>Preço com Desconto Máximo ({descontoMaximoPermitido}%):</span>
                      <strong className="text-[#5C4033]">
                        {formatCurrency(result.descontoImpacto.precoComDescontoMax)}
                      </strong>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
