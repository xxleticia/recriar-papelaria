'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { ClientData, Order, OrderItem } from '@/lib/types';
import {
  formatCurrency,
  validateCPF,
  formatPhone,
  createWhatsAppLink,
  getWhatsAppClean,
} from '@/lib/formatters';
import {
  X,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Truck,
  Store,
  CreditCard,
  QrCode,
  Printer,
  MessageCircle,
  Copy,
  Calendar,
  Lock,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, cartSubtotal, appliedCoupon, placeOrder, settings } = useStore();

  // Form State
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'retirada' | 'entrega'>('retirada');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Luís');
  const [state, setState] = useState('MA');
  const [zipCode, setZipCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CartaoCredito' | 'CartaoDebito' | 'Dinheiro'>('PIX');
  const [notes, setNotes] = useState('');
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentWhatsapp, setConsentWhatsapp] = useState(true);

  // Status & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

  const shippingFee = shippingMethod === 'entrega' ? 15.0 : 0;
  const discountValue = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, cartSubtotal - discountValue + shippingFee);

  // CPF input formatter
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 9) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6, 9)}-${val.slice(9)}`;
    } else if (val.length > 6) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6)}`;
    } else if (val.length > 3) {
      val = `${val.slice(0, 3)}.${val.slice(3)}`;
    }
    setCpf(val);
  };

  // WhatsApp input formatter
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    setWhatsapp(val);
  };

  // BirthDate input formatter DD/MM/AAAA
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 4) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
    } else if (val.length > 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setBirthDate(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validations
    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    if (cpf.trim()) {
      const cleanCpf = cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11 || !validateCPF(cleanCpf)) {
        setErrorMsg('O CPF informado é inválido. Por favor, verifique os dígitos.');
        return;
      }
    }

    if (!birthDate.trim()) {
      setErrorMsg('Por favor, informe sua data de nascimento.');
      return;
    }

    const birthParts = birthDate.split('/');
    if (birthParts.length === 3) {
      const day = parseInt(birthParts[0], 10);
      const month = parseInt(birthParts[1], 10) - 1;
      const year = parseInt(birthParts[2], 10);
      const bDate = new Date(year, month, day);
      const today = new Date();

      if (isNaN(bDate.getTime()) || bDate > today || year < 1920) {
        setErrorMsg('Data de nascimento inválida ou futura. Use o formato DD/MM/AAAA.');
        return;
      }
    } else {
      setErrorMsg('Data de nascimento incompleta. Use o formato DD/MM/AAAA.');
      return;
    }

    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10) {
      setErrorMsg('Por favor, informe um WhatsApp válido com DDD para contato e aprovação de arte.');
      return;
    }

    if (shippingMethod === 'entrega') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setErrorMsg('Por favor, preencha o endereço completo de entrega (Rua, Número e Bairro).');
        return;
      }
    }

    if (!consentTerms) {
      setErrorMsg('É necessário aceitar os Termos de Uso e Política de Privacidade para prosseguir.');
      return;
    }

    setIsSubmitting(true);

    try {
      const clientData: ClientData = {
        name: name.trim(),
        cpf: cpf.trim() ? cpf.replace(/\D/g, '') : undefined,
        birthDate: birthDate.trim(),
        email: email.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        address:
          shippingMethod === 'entrega'
            ? {
                street: street.trim(),
                number: number.trim(),
                complement: complement.trim() || undefined,
                neighborhood: neighborhood.trim(),
                city: city.trim(),
                state: state.trim(),
                zipCode: zipCode.trim(),
              }
            : undefined,
        consentTerms,
        consentWhatsapp,
      };

      const orderItems: OrderItem[] = cart.map((item) => ({
        id: item.cartItemId,
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        photo: item.product.photos[0],
        quantity: item.quantity,
        unitPrice: item.totalUnitPrice,
        subtotal: item.totalUnitPrice * item.quantity,
        customizations: item.customizations,
        additionalCost: item.additionalCost,
      }));

      const payload: Partial<Order> = {
        client: clientData,
        items: orderItems,
        shippingMethod,
        shippingFee,
        paymentMethod,
        paymentStatus: 'Pendente',
        status: 'Novo',
        isOpenSale: false,
        couponCode: appliedCoupon?.coupon.code,
        discountValue,
        subtotal: cartSubtotal,
        total,
        origin: 'vitrine',
        internalNotes: notes.trim() || undefined,
      };

      const result = await placeOrder(payload);

      if (result.success && result.order) {
        setConfirmedOrder(result.order);
        // Trigger celebratory confetti dynamically in browser
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#5C4033', '#B08968', '#C49A45', '#F5EBDD'],
          });
        } catch {
          // ignore if canvas-confetti fails
        }
      } else {
        setErrorMsg(result.error || 'Erro ao registrar pedido.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(settings.whatsapp);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleSendToWhatsApp = () => {
    if (!confirmedOrder) return;
    let msg = `*NOVO PEDIDO - ${settings.name.toUpperCase()}*\n`;
    msg += `Número do Pedido: *${confirmedOrder.id}*\n`;
    msg += `Cliente: ${confirmedOrder.client.name}\n`;
    msg += `WhatsApp: ${formatPhone(confirmedOrder.client.whatsapp)}\n\n`;
    msg += `*ITENS:* \n`;
    confirmedOrder.items.forEach((item) => {
      msg += `• ${item.quantity}x ${item.productName} (${formatCurrency(item.subtotal)})\n`;
      if (item.customizations?.customText) {
        msg += `   Gravação: "${item.customizations.customText}"\n`;
      }
      if (item.customizations?.format) {
        msg += `   Formato: ${item.customizations.format}\n`;
      }
    });
    msg += `\nSubtotal: ${formatCurrency(confirmedOrder.subtotal)}\n`;
    if (confirmedOrder.discountValue > 0) {
      msg += `Desconto: -${formatCurrency(confirmedOrder.discountValue)}\n`;
    }
    msg += `Entrega: ${confirmedOrder.shippingMethod === 'entrega' ? formatCurrency(confirmedOrder.shippingFee) : 'Retirada no Ateliê'}\n`;
    msg += `*TOTAL: ${formatCurrency(confirmedOrder.total)}*\n`;
    msg += `Pagamento: ${confirmedOrder.paymentMethod}\n\n`;
    msg += `Olá! Acabei de enviar meu pedido pela vitrine virtual. Segue o comprovante para conferência!`;

    const link = createWhatsAppLink(settings.whatsapp, msg);
    window.open(link, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#B08968]/30 overflow-hidden my-4 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F5EBDD] border-b border-[#B08968]/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#5C4033]" />
              <h2 className="font-serif text-lg font-bold text-[#5C4033]">
                {confirmedOrder ? 'Pedido Confirmado!' : 'Fechamento do Pedido'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-black/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 md:p-8">
            {confirmedOrder ? (
              /* Success Confirmation Screen */
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#5C4033]">
                    Obrigado, {confirmedOrder.client.name.split(' ')[0]}!
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Seu pedido foi registrado com sucesso e já está disponível em nosso ateliê.
                  </p>
                </div>

                {/* Order ID Box */}
                <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-dashed border-[#C49A45] max-w-md mx-auto text-center space-y-1">
                  <span className="text-[11px] text-gray-400 font-semibold uppercase">Número do Pedido</span>
                  <div className="font-mono text-2xl font-bold text-[#5C4033]">{confirmedOrder.id}</div>
                  <span className="text-xs text-[#B08968] block">
                    Total: <strong>{formatCurrency(confirmedOrder.total)}</strong> ({confirmedOrder.items.length} item(s))
                  </span>
                </div>

                {/* Payment Instructions (PIX) */}
                {confirmedOrder.paymentMethod === 'PIX' && (
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-left max-w-lg mx-auto space-y-3">
                    <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                      <QrCode className="w-5 h-5 text-[#C49A45]" />
                      <span>Instruções para Pagamento via PIX</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Para iniciarmos a confecção da sua arte e produção, efetue a transferência PIX no valor de{' '}
                      <strong>{formatCurrency(confirmedOrder.total)}</strong> para a chave abaixo:
                    </p>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-300">
                      <div className="text-xs font-mono text-gray-800">
                        <span className="text-gray-400 text-[10px] block">Chave PIX (Telefone/WhatsApp):</span>
                        {settings.whatsapp}
                      </div>
                      <button
                        onClick={handleCopyPix}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5C4033] text-white text-xs font-medium rounded-lg hover:bg-[#432d23] transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedPix ? 'Copiado!' : 'Copiar Chave'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-amber-700 italic">
                      ⚠️ O pedido é considerado confirmado após o envio do comprovante para o nosso WhatsApp.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowReceipt(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#5C4033] border border-[#B08968]/40 hover:bg-[#F5EBDD] text-xs font-semibold rounded-full shadow-xs transition"
                  >
                    <Printer className="w-4 h-4 text-[#C49A45]" />
                    <span>Visualizar / Imprimir Recibo</span>
                  </button>

                  <button
                    onClick={handleSendToWhatsApp}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar Pedido pelo WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Customer Information */}
                <div>
                  <h3 className="font-serif text-base font-bold text-[#5C4033] border-b border-[#F5EBDD] pb-2 mb-3">
                    1. Dados do Cliente
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-gray-700 mb-1">
                        Nome Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Letícia Garcia Santos"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Data de Nascimento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={birthDate}
                        onChange={handleBirthDateChange}
                        placeholder="DD/MM/AAAA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Utilizada para ações e cupons especiais de aniversário.
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        CPF (Opcional - para emissão fiscal)
                      </label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Armazenado com segurança e mascarado no recibo.
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        WhatsApp para Contato / Aprovação <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={whatsapp}
                        onChange={handleWhatsappChange}
                        placeholder="(99) 98181-4313"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">E-mail</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Option */}
                <div>
                  <h3 className="font-serif text-base font-bold text-[#5C4033] border-b border-[#F5EBDD] pb-2 mb-3">
                    2. Forma de Entrega
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <button
                      type="button"
                      onClick={() => setShippingMethod('retirada')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                        shippingMethod === 'retirada'
                          ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                          : 'border-gray-200 text-gray-700 bg-white hover:border-[#B08968]/50'
                      }`}
                    >
                      <Store className="w-4 h-4 text-[#C49A45] shrink-0 mt-0.5" />
                      <div>
                        <div>Retirada no Ateliê</div>
                        <div className="text-[11px] text-emerald-700 font-bold">Grátis (R$ 0,00)</div>
                        <div className="text-[10px] text-gray-500 font-normal">São Luís - MA</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingMethod('entrega')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                        shippingMethod === 'entrega'
                          ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                          : 'border-gray-200 text-gray-700 bg-white hover:border-[#B08968]/50'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-[#C49A45] shrink-0 mt-0.5" />
                      <div>
                        <div>Entrega em Domicílio / Envio</div>
                        <div className="text-[11px] text-gray-900 font-bold">R$ 15,00</div>
                        <div className="text-[10px] text-gray-500 font-normal">Envio para todo Brasil</div>
                      </div>
                    </button>
                  </div>

                  {shippingMethod === 'entrega' && (
                    <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-gray-700 font-medium mb-1">Rua / Logradouro</label>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Ex: Av. dos Holandeses"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C49A45]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">Número</label>
                        <input
                          type="text"
                          required
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          placeholder="Ex: 120"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C49A45]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">Complemento</label>
                        <input
                          type="text"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          placeholder="Apto, Bloco..."
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C49A45]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">Bairro</label>
                        <input
                          type="text"
                          required
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="Ex: Calhau"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C49A45]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">CEP</label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="65000-000"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C49A45]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Option */}
                <div>
                  <h3 className="font-serif text-base font-bold text-[#5C4033] border-b border-[#F5EBDD] pb-2 mb-3">
                    3. Forma de Pagamento
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'PIX', label: 'PIX', icon: QrCode, badge: 'Mais Rápido' },
                      { id: 'CartaoCredito', label: 'Cartão Crédito', icon: CreditCard },
                      { id: 'CartaoDebito', label: 'Cartão Débito', icon: CreditCard },
                      { id: 'Dinheiro', label: 'Dinheiro', icon: Store },
                    ].map((p) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPaymentMethod(p.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                            paymentMethod === p.id
                              ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-bold'
                              : 'border-gray-200 text-gray-700 bg-white hover:border-[#B08968]/50'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-[#C49A45]" />
                          <span>{p.label}</span>
                          {p.badge && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                              {p.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Observações do Pedido (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instruções sobre prazos, embalagens especiais ou preferências..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45]"
                  />
                </div>

                {/* Privacy Policy & LGPD Consents */}
                <div className="p-4 bg-[#F5EBDD]/40 rounded-2xl border border-[#B08968]/30 space-y-2 text-xs text-gray-700">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="mt-0.5 rounded text-[#5C4033] focus:ring-[#C49A45]"
                    />
                    <span>
                      Declaro que li e concordo com os{' '}
                      <strong className="text-[#5C4033]">Termos de Uso e Política de Privacidade (LGPD)</strong>.
                      Seus dados pessoais serão armazenados com segurança apenas para o cumprimento do pedido.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer pt-1 border-t border-[#B08968]/20">
                    <input
                      type="checkbox"
                      checked={consentWhatsapp}
                      onChange={(e) => setConsentWhatsapp(e.target.checked)}
                      className="mt-0.5 rounded text-[#5C4033] focus:ring-[#C49A45]"
                    />
                    <span>
                      Autorizo o recebimento de mensagens e mimos especiais no meu WhatsApp no dia do meu aniversário
                      (Consentimento opcional e revogável a qualquer momento).
                    </span>
                  </label>
                </div>

                {/* Detailed Summary Box */}
                <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD] space-y-2 text-xs">
                  <div className="font-serif font-bold text-[#5C4033] text-sm mb-1">Resumo dos Valores:</div>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal dos Produtos ({cart.length} itens):</span>
                    <span>{formatCurrency(cartSubtotal)}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Desconto ({appliedCoupon?.coupon.code}):</span>
                      <span>- {formatCurrency(discountValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Frete / Entrega:</span>
                    <span>{shippingFee > 0 ? formatCurrency(shippingFee) : 'Grátis (Retirada)'}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#5C4033] pt-2 border-t border-gray-200">
                    <span>TOTAL A PAGAR:</span>
                    <span className="text-lg text-[#C49A45]">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#5C4033] hover:bg-[#432d23] text-white font-semibold text-sm rounded-full shadow-lg hover:shadow-xl transition disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-[#C49A45]" />
                  <span>{isSubmitting ? 'Registrando Pedido...' : 'Confirmar e Concluir Pedido'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {showReceipt && confirmedOrder && (
        <ReceiptModal
          order={confirmedOrder}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}
