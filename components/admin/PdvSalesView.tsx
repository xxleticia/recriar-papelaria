'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/lib/store-context';
import { Product, Order, OrderItem, ClientData, OrderStatus } from '@/lib/types';
import { formatCurrency, formatPhone, createWhatsAppLink } from '@/lib/formatters';
import {
  Barcode,
  Search,
  UserPlus,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle,
  AlertCircle,
  Camera,
  ShoppingBag,
  CreditCard,
  User,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';
import { ReceiptModal } from '../ReceiptModal';

export function PdvSalesView() {
  const { products, clients, adminAddClient, placeOrder, settings } = useStore();

  // Search & Scanner
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cart in PDV
  interface PdvItem {
    product: Product;
    quantity: number;
    unitPrice: number;
    customText?: string;
    notes?: string;
  }
  const [items, setItems] = useState<PdvItem[]>([]);

  // Client Selection & Quick Add
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientWhatsapp, setNewClientWhatsapp] = useState('');
  const [newClientCpf, setNewClientCpf] = useState('');
  const [newClientBirthDate, setNewClientBirthDate] = useState('');

  // Sale Options
  const [isOpenSale, setIsOpenSale] = useState(false);
  const [saleStatus, setSaleStatus] = useState<OrderStatus>('Aguardando pagamento');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CartaoCredito' | 'CartaoDebito' | 'Dinheiro' | 'Pendente'>('PIX');
  const [paymentStatus, setPaymentStatus] = useState<'Pendente' | 'Confirmado'>('Confirmado');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [internalNotes, setInternalNotes] = useState('');

  // Finished Sale Receipt Modal
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Handle barcode search / submission
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim().toLowerCase();
    const found = products.find(
      (p) => p.barcode?.toLowerCase() === query || p.sku?.toLowerCase() === query
    );

    if (found) {
      addProductToPdv(found);
      setBarcodeInput('');
      setFeedbackMsg({ text: `Produto "${found.name}" adicionado pelo código de barras!`, isError: false });
    } else {
      setFeedbackMsg({ text: `Nenhum produto encontrado com o código "${barcodeInput}".`, isError: true });
    }
  };

  const addProductToPdv = (product: Product) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          product,
          quantity: product.minQuantity || 1,
          unitPrice: product.promotionalPrice || product.price,
        },
      ];
    });
  };

  const updateItemQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  };

  const updateItemPrice = (productId: string, price: number) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, unitPrice: price } : i))
    );
  };

  const updateItemCustomText = (productId: string, text: string) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, customText: text } : i))
    );
  };

  // Camera Barcode Scanning (using native BarcodeDetector if available)
  const toggleCameraScanner = async () => {
    if (scannerActive) {
      setScannerActive(false);
      return;
    }
    setScannerActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // If BarcodeDetector API exists in browser
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'qr_code'],
          });
          const interval = setInterval(async () => {
            if (!videoRef.current) {
              clearInterval(interval);
              return;
            }
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                setBarcodeInput(code);
                clearInterval(interval);
                stream.getTracks().forEach((t) => t.stop());
                setScannerActive(false);
                // Search product
                const found = products.find((p) => p.barcode === code || p.sku === code);
                if (found) {
                  addProductToPdv(found);
                }
              }
            } catch {}
          }, 400);
        }
      }
    } catch {
      alert('Não foi possível acessar a câmera para leitura do código de barras.');
      setScannerActive(false);
    }
  };

  // Quick Client Creation
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newCli: ClientData = {
      id: `cli-${Date.now()}`,
      name: newClientName.trim(),
      whatsapp: newClientWhatsapp.replace(/\D/g, ''),
      cpf: newClientCpf.replace(/\D/g, '') || undefined,
      birthDate: newClientBirthDate || '',
      email: '',
      consentTerms: true,
      consentWhatsapp: true,
    };

    await adminAddClient(newCli);
    setSelectedClientId(newCli.id!);
    setShowNewClientModal(false);
    setNewClientName('');
    setNewClientWhatsapp('');
    setNewClientCpf('');
    setNewClientBirthDate('');
  };

  // Subtotal & Total
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const total = Math.max(0, subtotal - discountValue + shippingFee);

  // Finalize Sale
  const handleFinalizeSale = async () => {
    if (items.length === 0) {
      setFeedbackMsg({ text: 'Adicione pelo menos um item à venda.', isError: true });
      return;
    }

    const client = clients.find((c) => c.id === selectedClientId) || {
      name: 'Cliente Balcão / Não Identificado',
      whatsapp: '',
      birthDate: '',
      email: '',
      consentTerms: true,
      consentWhatsapp: false,
    };

    setIsProcessing(true);
    setFeedbackMsg(null);

    const orderItems: OrderItem[] = items.map((i, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: i.product.id,
      productName: i.product.name,
      barcode: i.product.barcode,
      photo: i.product.photos[0],
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.unitPrice * i.quantity,
      customizations: {
        customText: i.customText || undefined,
        notes: i.notes || undefined,
      },
    }));

    const finalStatus: OrderStatus = isOpenSale ? 'Aguardando pagamento' : saleStatus;

    const payload: Partial<Order> = {
      client,
      items: orderItems,
      shippingMethod: shippingFee > 0 ? 'entrega' : 'retirada',
      shippingFee,
      paymentMethod,
      paymentStatus: isOpenSale ? 'Pendente' : paymentStatus,
      status: finalStatus,
      isOpenSale,
      discountValue,
      subtotal,
      total,
      origin: 'pdv_admin',
      internalNotes: internalNotes.trim() || undefined,
    };

    const res = await placeOrder(payload);
    setIsProcessing(false);

    if (res.success && res.order) {
      setReceiptOrder(res.order);
      setItems([]);
      setDiscountValue(0);
      setShippingFee(0);
      setInternalNotes('');
      setFeedbackMsg({
        text: `Venda ${res.order.id} registrada com sucesso! ${isOpenSale ? '(Salva como Venda em Aberto)' : ''}`,
        isError: false,
      });
    } else {
      setFeedbackMsg({ text: res.error || 'Erro ao registrar venda.', isError: true });
    }
  };

  // Filter products for fast pick
  const filteredProducts = products.filter(
    (p) =>
      p.active &&
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title & Feedback */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#C49A45]" />
            <span>Ponto de Venda (PDV) & Balcão</span>
          </h2>
          <p className="text-xs text-gray-500">
            Realize vendas presenciais, encomendas rápidas, leitura de código de barras e emissão imediata de recibos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={() => setItems([])}
              className="text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition"
            >
              Limpar Venda
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            feedbackMsg.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedbackMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Grid: Left (Product Selection & Barcode Scanner) vs Right (Sale Cart & Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barcode Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5C4033] flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-[#C49A45]" />
                <span>Leitor de Código de Barras (Scanner ou Teclado)</span>
              </label>

              <button
                type="button"
                onClick={toggleCameraScanner}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  scannerActive
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-[#F5EBDD] text-[#5C4033] border-[#B08968]/30 hover:bg-[#ebdcc9]'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#C49A45]" />
                <span>{scannerActive ? 'Fechar Câmera' : 'Usar Câmera'}</span>
              </button>
            </div>

            {/* Video preview if camera scanner is open */}
            {scannerActive && (
              <div className="relative aspect-video w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black border-2 border-[#C49A45]">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-red-500/60 m-8 pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-white bg-black/60 px-2 py-0.5 rounded">
                    Aponte para o código de barras
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Escaneie ou digite o código de barras (Ex: 7891000100018)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] font-mono text-[#5C4033]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white text-xs font-semibold rounded-xl transition"
              >
                Buscar / Bipar
              </button>
            </form>
          </div>

          {/* Quick Product Catalog */}
          <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5C4033]">Catálogo Rápido de Produtos</span>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full pl-8 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addProductToPdv(prod)}
                  className="p-2.5 bg-[#FFFDF9] hover:bg-[#F5EBDD]/50 border border-[#F5EBDD] hover:border-[#C49A45]/50 rounded-xl cursor-pointer transition text-xs flex flex-col justify-between group shadow-2xs"
                >
                  <div className="space-y-1">
                    <img
                      src={prod.photos[0]}
                      alt=""
                      className="w-full h-20 object-cover rounded-lg group-hover:scale-102 transition"
                    />
                    <h4 className="font-semibold text-[#5C4033] line-clamp-1">{prod.name}</h4>
                    {prod.barcode && (
                      <span className="text-[10px] text-gray-400 font-mono block">Cód: {prod.barcode}</span>
                    )}
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-bold text-[#C49A45]">
                      {formatCurrency(prod.promotionalPrice || prod.price)}
                    </span>
                    <button
                      type="button"
                      className="w-6 h-6 rounded-full bg-[#5C4033] text-white flex items-center justify-center hover:bg-[#C49A45] transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 5 cols (Order Details, Client Selection, Total & Receipt) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Client Selection Box */}
          <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5C4033] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#C49A45]" />
                <span>Cliente da Venda</span>
              </label>

              <button
                type="button"
                onClick={() => setShowNewClientModal(true)}
                className="inline-flex items-center gap-1 text-[11px] text-[#C49A45] hover:text-[#5C4033] font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Cadastrar Novo</span>
              </button>
            </div>

            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] bg-white text-[#5C4033]"
            >
              <option value="">Cliente Balcão / Não cadastrado</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.whatsapp ? `(${formatPhone(c.whatsapp)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current Sale Items */}
          <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-[#5C4033]">Itens na Venda ({items.length})</span>
              <span className="text-xs text-gray-500 font-medium">Subtotal: {formatCurrency(subtotal)}</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Nenhum item adicionado. Bipe um código de barras ou clique em um produto ao lado.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 bg-[#FFFDF9] rounded-xl border border-[#F5EBDD] space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-[#5C4033]">{item.product.name}</span>
                        {item.product.barcode && (
                          <span className="block text-[10px] text-gray-400 font-mono">
                            Cód: {item.product.barcode}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => updateItemQty(item.product.id, 0)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Qty +/- */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateItemQty(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQty(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Editable Price */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">R$</span>
                        <input
                          type="number"
                          step="0.10"
                          value={item.unitPrice}
                          onChange={(e) => updateItemPrice(item.product.id, parseFloat(e.target.value) || 0)}
                          className="w-16 px-1 py-0.5 text-xs border border-gray-200 rounded text-right font-medium"
                        />
                      </div>

                      <span className="font-bold text-[#C49A45]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>

                    {/* Quick custom text note */}
                    <input
                      type="text"
                      value={item.customText || ''}
                      onChange={(e) => updateItemCustomText(item.product.id, e.target.value)}
                      placeholder="Gravação/Nome personalizado no item..."
                      className="w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded focus:ring-1 focus:ring-[#C49A45]"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sale Settings: Discount, Open Sale, Payment */}
          <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3 text-xs">
            {/* Venda em Aberto Toggle */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                <input
                  type="checkbox"
                  checked={isOpenSale}
                  onChange={(e) => setIsOpenSale(e.target.checked)}
                  className="rounded text-amber-700 focus:ring-amber-500"
                />
                <span>Deixar Venda em Aberto (Orçamento / Produção em Andamento)</span>
              </label>
              <p className="text-[10px] text-amber-700 pl-5">
                Permite registrar a encomenda sem concluir pagamento imediato. Todas as vendas podem ser editadas depois.
              </p>
            </div>

            {/* Discount & Shipping */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-0.5">Desconto (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-0.5">Taxa de Entrega (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Payment Method & Status */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-0.5">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                >
                  <option value="PIX">PIX</option>
                  <option value="CartaoCredito">Cartão de Crédito</option>
                  <option value="CartaoDebito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro em Espécie</option>
                  <option value="Pendente">A Definir / Pendente</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-0.5">Status do Pedido</label>
                <select
                  value={saleStatus}
                  onChange={(e) => setSaleStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                >
                  <option value="Aguardando pagamento">Aguardando Pagamento</option>
                  <option value="Pagamento confirmado">Pagamento Confirmado</option>
                  <option value="Em criação">Em Criação de Arte</option>
                  <option value="Em produção">Em Produção</option>
                  <option value="Pronto para retirada">Pronto para Retirada</option>
                  <option value="Concluído">Concluído (Entregue)</option>
                </select>
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-gray-600 mb-0.5">Notas Internas do Ateliê</label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Ex: Cliente vai trazer a foto amanhã / Pago 50% de entrada..."
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            {/* Total Box */}
            <div className="p-3 bg-[#F5EBDD]/60 rounded-xl space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(discountValue)}</span>
                </div>
              )}
              {shippingFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Entrega:</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#5C4033] pt-1 border-t border-[#B08968]/20">
                <span>TOTAL FINAL:</span>
                <span className="text-base text-[#C49A45]">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Finalize Button */}
            <button
              type="button"
              onClick={handleFinalizeSale}
              disabled={isProcessing || items.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-[#C49A45]" />
              <span>
                {isProcessing
                  ? 'Processando...'
                  : isOpenSale
                  ? 'Salvar Venda em Aberto'
                  : 'Concluir Venda & Emitir Recibo'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-[#B08968]/30">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-serif text-lg font-bold text-[#5C4033]">Cadastrar Novo Cliente</h3>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={newClientWhatsapp}
                  onChange={(e) => setNewClientWhatsapp(e.target.value)}
                  placeholder="(99) 98181-4313"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Data de Nascimento (DD/MM/AAAA)</label>
                <input
                  type="text"
                  value={newClientBirthDate}
                  onChange={(e) => setNewClientBirthDate(e.target.value)}
                  placeholder="15/10/1990"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">CPF (Opcional)</label>
                <input
                  type="text"
                  value={newClientCpf}
                  onChange={(e) => setNewClientCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C4033] text-white rounded-xl font-bold"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recibo da Venda Finalizada */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
}
