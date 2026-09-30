export type OrderStatus =
  | 'Novo'
  | 'Aguardando pagamento'
  | 'Pagamento confirmado'
  | 'Aguardando informações do cliente'
  | 'Em criação'
  | 'Arte enviada para aprovação'
  | 'Alteração solicitada'
  | 'Arte aprovada'
  | 'Em produção'
  | 'Pronto para retirada'
  | 'Enviado'
  | 'Concluído'
  | 'Cancelado';

export interface CustomizationOptionItem {
  id: string;
  name: string;
  priceModifier?: number; // Adicional em R$
}

export interface CustomizationFieldConfig {
  enabled: boolean;
  label: string;
  required?: boolean;
  options: CustomizationOptionItem[];
}

export interface ProductCustomizationConfig {
  format?: CustomizationFieldConfig;
  size?: CustomizationFieldConfig;
  paperType?: CustomizationFieldConfig;
  printType?: CustomizationFieldConfig;
  finish?: CustomizationFieldConfig;
  lamination?: CustomizationFieldConfig;
  specialCut?: CustomizationFieldConfig;
  accessories?: CustomizationFieldConfig;
  theme?: CustomizationFieldConfig;
  allowCustomText?: boolean;
  customTextLabel?: string;
  allowImageUpload?: boolean;
  allowNotes?: boolean;
}

export interface PriceTier {
  minQty: number;
  unitPrice: number;
}

export interface ProductCostComposition {
  custoMateriais: number;
  perdasPercent: number;
  horasTrabalhadas: number;
  valorHora: number;
  impressao: number;
  acabamentos: number;
  embalagem: number;
  terceirizacao: number;
  freteRateado: number;
  custosFixosRateados: number;
  margemLucroPercent: number;
  taxasPercentTotais: number; // impostos + comissões + taxas cartão
  precoFinalSugerido: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string; // Código de barras EAN/personalizado
  categoryId: string;
  description: string;
  price: number; // Preço base unitário (R$)
  promotionalPrice?: number | null;
  minQuantity: number;
  estimatedDays: number; // Prazo estimado de produção
  photos: string[]; // URLs ou base64
  isNew?: boolean;
  isFeatured?: boolean;
  onSale?: boolean;
  active: boolean;
  stock?: number | null; // null = sob encomenda
  customizationConfig: ProductCustomizationConfig;
  priceTiers?: PriceTier[];
  costComposition?: ProductCostComposition;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active: boolean;
  order: number;
}

export interface SelectedCustomizations {
  format?: string;
  size?: string;
  paperType?: string;
  printType?: string;
  finish?: string;
  lamination?: string;
  specialCut?: string;
  accessories?: string;
  theme?: string;
  customText?: string;
  customerUploadedImage?: string; // base64 / data URL
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  barcode?: string;
  photo?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customizations?: SelectedCustomizations;
  additionalCost?: number;
}

export interface ClientData {
  id?: string;
  name: string;
  cpf?: string; // Armazenado com segurança, exibido mascarado
  birthDate: string; // DD/MM/AAAA
  email: string;
  whatsapp: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  consentTerms: boolean;
  consentWhatsapp: boolean;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface FiscalDocument {
  status: 'Pendente' | 'Emitida' | 'Rejeitada' | 'Cancelada';
  type: 'NFC-e' | 'NF-e' | 'NFS-e';
  number?: string;
  key?: string; // Chave de acesso 44 dígitos
  protocol?: string;
  issuedAt?: string;
  xmlUrl?: string;
  danfeUrl?: string;
  errorMessage?: string;
}

export interface Order {
  id: string; // Ex: REC-2026-001
  date: string; // ISO
  status: OrderStatus;
  isOpenSale: boolean; // Se a venda está em aberto (orçamento/balcão)
  client: ClientData;
  items: OrderItem[];
  shippingMethod: 'retirada' | 'entrega' | 'correios';
  shippingFee: number;
  paymentMethod: 'PIX' | 'CartaoCredito' | 'CartaoDebito' | 'Dinheiro' | 'Boleto' | 'Pendente';
  paymentStatus: 'Pendente' | 'Confirmado' | 'Cancelado';
  couponCode?: string;
  discountValue: number;
  subtotal: number;
  total: number;
  trackingCode?: string;
  internalNotes?: string;
  statusHistory: OrderStatusHistoryItem[];
  origin: 'vitrine' | 'pdv_admin';
  fiscalDocument?: FiscalDocument;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  isBirthdayCoupon?: boolean;
}

export interface StoreBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link?: string;
  badge?: string;
  active: boolean;
}

export interface StoreColors {
  primary: string; // Marrom-escuro #5C4033
  secondary: string; // Marrom-claro #B08968
  accent: string; // Dourado #C49A45
  beige: string; // Bege #F5EBDD
  cream: string; // Branco de apoio #FFFDF9
}

export interface FiscalSettings {
  enabled: boolean;
  provider: 'Focus NFe' | 'Nuvem Fiscal' | 'Webmania' | 'eNotas';
  environment: 'homologacao' | 'producao';
  defaultDocType: 'NFC-e' | 'NF-e' | 'NFS-e';
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  inscricaoMunicipal?: string;
  regimeTributario: 'Simples Nacional' | 'MEI' | 'Lucro Presumido' | 'Lucro Real';
  apiKey?: string;
  certificateConfigured: boolean;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  whatsapp: string; // 99981814313
  email: string;
  instagram: string;
  address: string;
  logoUrl: string;
  banners: StoreBanner[];
  colors: StoreColors;
  announcementText: string;
  productionNotice: string;
  fiscalSettings: FiscalSettings;
  birthdayMessageTemplate: string;
  birthdayCouponDiscountPercent: number;
  birthdayCouponDaysValid: number;
}
