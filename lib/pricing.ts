export interface PricingCalculationInput {
  custoMateriais: number; // R$
  percentualPerdas: number; // % (ex: 10)
  horasTrabalhadas: number; // horas (ex: 1.5)
  valorHora: number; // R$/hora (ex: 35.00)
  impressao: number; // R$ total
  acabamentos: number; // R$ total
  embalagem: number; // R$ total
  terceirizacao: number; // R$ total
  freteRateado: number; // R$ total
  custosFixosRateados: number; // R$ total
  margemLucro: number; // % desejada (ex: 40)
  taxasPercentuaisTotais: number; // % (impostos + comissão + cartão, ex: 12)
  quantidadeProduzida: number; // unidades do lote (ex: 20)
  descontoMaximoPermitido?: number; // % máximo de desconto
}

export interface PricingCalculationResult {
  isValid: boolean;
  errorMessage?: string;
  materiaisComPerdas: number;
  maoDeObra: number;
  custoBaseLote: number;
  custoBaseUnitario: number;
  precoSemTaxasLote: number;
  precoFinalLote: number;
  precoFinalUnitario: number;
  lucroReaisLote: number;
  lucroReaisUnitario: number;
  margemEfetivaPercent: number;
  pontoEquilibrioUnidades: number;
  precoMinimoRecomendadoUnitario: number; // Preço para margem 0 (apenas cobrir custos + taxas)
  precoMinimoRecomendadoLote: number;
  descontoImpacto?: {
    precoComDescontoMax: number;
    lucroRestante: number;
    margemAposDesconto: number;
  };
  tierEstimates: {
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountPercent: number;
  }[];
}

export function calculatePricing(input: PricingCalculationInput): PricingCalculationResult {
  const {
    custoMateriais = 0,
    percentualPerdas = 0,
    horasTrabalhadas = 0,
    valorHora = 0,
    impressao = 0,
    acabamentos = 0,
    embalagem = 0,
    terceirizacao = 0,
    freteRateado = 0,
    custosFixosRateados = 0,
    margemLucro = 0,
    taxasPercentuaisTotais = 0,
    quantidadeProduzida = 1,
    descontoMaximoPermitido = 10,
  } = input;

  const qty = Math.max(1, quantidadeProduzida);

  // Validação: taxas percentuais totais não podem ser >= 100%
  if (taxasPercentuaisTotais >= 100) {
    return {
      isValid: false,
      errorMessage: 'A soma das taxas percentuais (impostos, taxas de pagamento, comissão) deve ser estritamente inferior a 100%.',
      materiaisComPerdas: 0,
      maoDeObra: 0,
      custoBaseLote: 0,
      custoBaseUnitario: 0,
      precoSemTaxasLote: 0,
      precoFinalLote: 0,
      precoFinalUnitario: 0,
      lucroReaisLote: 0,
      lucroReaisUnitario: 0,
      margemEfetivaPercent: 0,
      pontoEquilibrioUnidades: 0,
      precoMinimoRecomendadoUnitario: 0,
      precoMinimoRecomendadoLote: 0,
      tierEstimates: [],
    };
  }

  // Validação: margem de lucro não pode ser >= 100%
  if (margemLucro >= 100) {
    return {
      isValid: false,
      errorMessage: 'A margem de lucro percentual deve ser inferior a 100%.',
      materiaisComPerdas: 0,
      maoDeObra: 0,
      custoBaseLote: 0,
      custoBaseUnitario: 0,
      precoSemTaxasLote: 0,
      precoFinalLote: 0,
      precoFinalUnitario: 0,
      lucroReaisLote: 0,
      lucroReaisUnitario: 0,
      margemEfetivaPercent: 0,
      pontoEquilibrioUnidades: 0,
      precoMinimoRecomendadoUnitario: 0,
      precoMinimoRecomendadoLote: 0,
      tierEstimates: [],
    };
  }

  // Fórmula solicitada:
  // materiais_com_perdas = custo_dos_materiais * (1 + percentual_de_perdas / 100)
  const materiaisComPerdas = custoMateriais * (1 + percentualPerdas / 100);

  // mao_de_obra = horas_trabalhadas * valor_da_hora
  const maoDeObra = horasTrabalhadas * valorHora;

  // custo_base = materiais_com_perdas + impressao + acabamentos + embalagem + terceirizacao + frete_rateado + mao_de_obra + custos_fixos_rateados
  const custoBaseLote =
    materiaisComPerdas +
    impressao +
    acabamentos +
    embalagem +
    terceirizacao +
    freteRateado +
    maoDeObra +
    custosFixosRateados;

  const custoBaseUnitario = custoBaseLote / qty;

  // preco_sem_taxas = custo_base / (1 - margem_de_lucro / 100)
  const divisorMargem = 1 - margemLucro / 100;
  const precoSemTaxasLote = divisorMargem > 0 ? custoBaseLote / divisorMargem : custoBaseLote;

  // preco_final = preco_sem_taxas / (1 - taxas_percentuais_totais / 100)
  const divisorTaxas = 1 - taxasPercentuaisTotais / 100;
  const precoFinalLote = divisorTaxas > 0 ? precoSemTaxasLote / divisorTaxas : precoSemTaxasLote;
  const precoFinalUnitario = precoFinalLote / qty;

  // Custo das taxas pagas
  const totalTaxas = precoFinalLote * (taxasPercentuaisTotais / 100);
  // Lucro líquido em Reais = Preço Final - Custo Base - Taxas
  const lucroReaisLote = precoFinalLote - custoBaseLote - totalTaxas;
  const lucroReaisUnitario = lucroReaisLote / qty;

  // Margem efetiva sobre o preço final
  const margemEfetivaPercent = precoFinalLote > 0 ? (lucroReaisLote / precoFinalLote) * 100 : 0;

  // Preço Mínimo Recomendado (Break-even: cobrindo custo base + taxas, margem 0)
  const precoMinimoRecomendadoLote = divisorTaxas > 0 ? custoBaseLote / divisorTaxas : custoBaseLote;
  const precoMinimoRecomendadoUnitario = precoMinimoRecomendadoLote / qty;

  // Ponto de equilíbrio de unidades (considerando custos fixos e margem de contribuição unitária)
  const margemContribuicaoUnit = precoFinalUnitario * (1 - taxasPercentuaisTotais / 100) - (materiaisComPerdas + impressao + acabamentos + embalagem + terceirizacao) / qty;
  const custosFixosTotais = custosFixosRateados + maoDeObra;
  const pontoEquilibrioUnidades = margemContribuicaoUnit > 0 ? Math.ceil(custosFixosTotais / margemContribuicaoUnit) : qty;

  // Impacto do desconto
  const precoComDescontoMax = precoFinalLote * (1 - (descontoMaximoPermitido || 0) / 100);
  const taxasAposDesconto = precoComDescontoMax * (taxasPercentuaisTotais / 100);
  const lucroRestante = precoComDescontoMax - custoBaseLote - taxasAposDesconto;
  const margemAposDesconto = precoComDescontoMax > 0 ? (lucroRestante / precoComDescontoMax) * 100 : 0;

  // Faixas de preço progressivas (escala de produção artesanal: 10, 25, 50, 100 un)
  // Com o aumento de volume, o custo de mão de obra e setup se diluem
  const tierQuantities = [10, 25, 50, 100];
  const tierEstimates = tierQuantities.map((tierQty) => {
    // Escala: diluição parcial de setup e mão de obra fixa
    const dilutionFactor = Math.pow(qty / tierQty, 0.25);
    const estimatedUnitCost = custoBaseUnitario * Math.min(1.2, Math.max(0.75, dilutionFactor));
    const tierUnitPrice = (estimatedUnitCost / divisorMargem) / divisorTaxas;
    const discountPercent = precoFinalUnitario > 0 ? Math.max(0, ((precoFinalUnitario - tierUnitPrice) / precoFinalUnitario) * 100) : 0;

    return {
      quantity: tierQty,
      unitPrice: Math.round(tierUnitPrice * 100) / 100,
      totalPrice: Math.round(tierUnitPrice * tierQty * 100) / 100,
      discountPercent: Math.round(discountPercent * 10) / 10,
    };
  });

  return {
    isValid: true,
    materiaisComPerdas: Math.round(materiaisComPerdas * 100) / 100,
    maoDeObra: Math.round(maoDeObra * 100) / 100,
    custoBaseLote: Math.round(custoBaseLote * 100) / 100,
    custoBaseUnitario: Math.round(custoBaseUnitario * 100) / 100,
    precoSemTaxasLote: Math.round(precoSemTaxasLote * 100) / 100,
    precoFinalLote: Math.round(precoFinalLote * 100) / 100,
    precoFinalUnitario: Math.round(precoFinalUnitario * 100) / 100,
    lucroReaisLote: Math.round(lucroReaisLote * 100) / 100,
    lucroReaisUnitario: Math.round(lucroReaisUnitario * 100) / 100,
    margemEfetivaPercent: Math.round(margemEfetivaPercent * 10) / 10,
    pontoEquilibrioUnidades,
    precoMinimoRecomendadoUnitario: Math.round(precoMinimoRecomendadoUnitario * 100) / 100,
    precoMinimoRecomendadoLote: Math.round(precoMinimoRecomendadoLote * 100) / 100,
    descontoImpacto: {
      precoComDescontoMax: Math.round(precoComDescontoMax * 100) / 100,
      lucroRestante: Math.round(lucroRestante * 100) / 100,
      margemAposDesconto: Math.round(margemAposDesconto * 10) / 10,
    },
    tierEstimates,
  };
}
