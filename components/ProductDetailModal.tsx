'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Product, SelectedCustomizations } from '@/lib/types';
import { formatCurrency, createWhatsAppLink } from '@/lib/formatters';
import { useStore } from '@/lib/store-context';
import {
  X,
  Clock,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Upload,
  Check,
  ChevronLeft,
  ChevronRight,
  Barcode,
  Info,
  Layers,
  Palette,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddedToCart,
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;
  return (
    <ProductDetailModalContent
      product={product}
      onClose={onClose}
      onAddedToCart={onAddedToCart}
    />
  );
}

function ProductDetailModalContent({
  product,
  onClose,
  onAddedToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddedToCart: () => void;
}) {
  const { settings, categories, addToCart } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const category = categories.find((c) => c.id === product.categoryId);

  // Gallery state
  const photos = product.photos.length > 0 ? product.photos : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'];
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Quantity state (respects minQuantity)
  const [quantity, setQuantity] = useState(product.minQuantity || 1);

  // Selected customizations
  const config = useMemo(() => product.customizationConfig || {}, [product.customizationConfig]);
  const [selectedFormat, setSelectedFormat] = useState<string>(config.format?.options[0]?.name || '');
  const [selectedPaperType, setSelectedPaperType] = useState<string>(config.paperType?.options[0]?.name || '');
  const [selectedFinish, setSelectedFinish] = useState<string>(config.finish?.options[0]?.name || '');
  const [selectedLamination, setSelectedLamination] = useState<string>(config.lamination?.options[0]?.name || '');
  const [selectedSpecialCut, setSelectedSpecialCut] = useState<string>(config.specialCut?.options[0]?.name || '');
  const [selectedAccessories, setSelectedAccessories] = useState<string>(config.accessories?.options[0]?.name || '');
  const [selectedTheme, setSelectedTheme] = useState<string>(config.theme?.options[0]?.name || '');
  const [customText, setCustomText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  // Handle image upload from client's device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Por favor, selecione uma imagem de até 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic price calculation
  const { unitPrice, additionalCostPerUnit, totalUnitPrice, totalPrice } = useMemo(() => {
    let basePrice = product.promotionalPrice && product.promotionalPrice > 0 ? product.promotionalPrice : product.price;

    // Check tier pricing
    if (product.priceTiers && product.priceTiers.length > 0) {
      const applicableTier = [...product.priceTiers]
        .sort((a, b) => b.minQty - a.minQty)
        .find((t) => quantity >= t.minQty);
      if (applicableTier) {
        basePrice = applicableTier.unitPrice;
      }
    }

    let addCost = 0;
    if (selectedFormat && config.format) {
      const opt = config.format.options.find((o) => o.name === selectedFormat);
      if (opt?.priceModifier) addCost += opt.priceModifier;
    }
    if (selectedPaperType && config.paperType) {
      const opt = config.paperType.options.find((o) => o.name === selectedPaperType);
      if (opt?.priceModifier) addCost += opt.priceModifier;
    }
    if (selectedFinish && config.finish) {
      const opt = config.finish.options.find((o) => o.name === selectedFinish);
      if (opt?.priceModifier) addCost += opt.priceModifier;
    }
    if (selectedLamination && config.lamination) {
      const opt = config.lamination.options.find((o) => o.name === selectedLamination);
      if (opt?.priceModifier) addCost += opt.priceModifier;
    }
    if (selectedSpecialCut && config.specialCut) {
      const opt = config.specialCut.options.find((o) => o.name === selectedSpecialCut);
      if (opt?.priceModifier) addCost += opt.priceModifier;
    }
    if (selectedAccessories && config.accessories) {
      const opt = config.accessories.options.find((o) => o.name === selectedAccessories);
      if (opt?.priceModifier) addCost += opt.priceModifier;
    }

    const unitTotal = Math.max(0, basePrice + addCost);
    return {
      unitPrice: basePrice,
      additionalCostPerUnit: addCost,
      totalUnitPrice: unitTotal,
      totalPrice: unitTotal * quantity,
    };
  }, [
    product,
    quantity,
    selectedFormat,
    selectedPaperType,
    selectedFinish,
    selectedLamination,
    selectedSpecialCut,
    selectedAccessories,
    config,
  ]);

  const handleAddToCart = () => {
    const customizations: SelectedCustomizations = {
      format: selectedFormat || undefined,
      paperType: selectedPaperType || undefined,
      finish: selectedFinish || undefined,
      lamination: selectedLamination || undefined,
      specialCut: selectedSpecialCut || undefined,
      accessories: selectedAccessories || undefined,
      theme: selectedTheme || undefined,
      customText: customText.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    addToCart(product, quantity, customizations, uploadedImagePreview || undefined);
    onAddedToCart();
    onClose();
  };

  const handleWhatsAppConsult = () => {
    let msg = `Olá, Ateliê ${settings.name}!\n`;
    msg += `Gostaria de encomendar / tirar dúvidas sobre o produto: *${product.name}*\n`;
    msg += `Quantidade: ${quantity} unidades\n`;
    if (selectedFormat) msg += `• Formato: ${selectedFormat}\n`;
    if (selectedPaperType) msg += `• Papel/Gramatura: ${selectedPaperType}\n`;
    if (selectedFinish) msg += `• Acabamento: ${selectedFinish}\n`;
    if (selectedLamination) msg += `• Laminação: ${selectedLamination}\n`;
    if (selectedAccessories) msg += `• Acessórios: ${selectedAccessories}\n`;
    if (selectedTheme) msg += `• Tema/Paleta: ${selectedTheme}\n`;
    if (customText) msg += `• Gravação: "${customText}"\n`;
    msg += `Total estimado: ${formatCurrency(totalPrice)}\n`;
    msg += `Prazo estimado: ${product.estimatedDays} dias úteis.\n`;

    const link = createWhatsAppLink(settings.whatsapp, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#B08968]/30 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5EBDD] bg-[#FFFDF9]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#B08968] uppercase tracking-wider">
              {category?.name || 'Papelaria Personalizada'}
            </span>
            {product.barcode && (
              <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                EAN: {product.barcode}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Gallery & Details */}
          <div className="space-y-4">
            {/* Main Active Image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F5EBDD]/40 border border-[#B08968]/20 shadow-inner group">
              <img
                src={photos[selectedPhotoIndex] || photos[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % photos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      idx === selectedPhotoIndex ? 'border-[#C49A45] ring-2 ring-[#C49A45]/30' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description & Production Time Box */}
            <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#F5EBDD] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5C4033]">
                <Clock className="w-4 h-4 text-[#C49A45]" />
                <span>Prazo de Confecção: ~{product.estimatedDays} dias úteis</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>

              {product.priceTiers && product.priceTiers.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-[#5C4033] block mb-1.5">
                    💡 Desconto Progressivo por Quantidade:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    {product.priceTiers.map((t, i) => (
                      <div
                        key={i}
                        className={`p-1.5 text-center rounded-lg border text-[11px] ${
                          quantity >= t.minQty
                            ? 'bg-[#5C4033] text-white border-[#5C4033] font-bold'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        <div>a partir de {t.minQty} un</div>
                        <div className="font-semibold">{formatCurrency(t.unitPrice)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#5C4033]">{product.name}</h2>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-[#C49A45]">
                  {formatCurrency(totalUnitPrice)}
                </span>
                <span className="text-xs text-gray-500">por unidade</span>
                {additionalCostPerUnit > 0 && (
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    (Base {formatCurrency(unitPrice)} + Adicionais {formatCurrency(additionalCostPerUnit)})
                  </span>
                )}
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-4 pt-2 border-t border-[#F5EBDD]">
              {/* Formato / Tamanho */}
              {config.format?.enabled && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.format.label || 'Formato / Tamanho'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.format.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedFormat(opt.name)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition flex justify-between items-center ${
                          selectedFormat === opt.name
                            ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                            : 'border-gray-200 hover:border-[#B08968]/50 text-gray-700 bg-white'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.priceModifier ? (
                          <span className="text-[10px] text-amber-800 font-medium">
                            {opt.priceModifier > 0 ? `+${formatCurrency(opt.priceModifier)}` : formatCurrency(opt.priceModifier)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Papel / Gramatura */}
              {config.paperType?.enabled && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.paperType.label || 'Tipo e Gramatura do Papel'}
                  </label>
                  <div className="space-y-1.5">
                    {config.paperType.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedPaperType(opt.name)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex justify-between items-center ${
                          selectedPaperType === opt.name
                            ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                            : 'border-gray-200 hover:border-[#B08968]/50 text-gray-700 bg-white'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.priceModifier ? (
                          <span className="text-[10px] text-amber-800 font-medium">
                            +{formatCurrency(opt.priceModifier)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Acabamento / Wire-o */}
              {config.finish?.enabled && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.finish.label || 'Acabamento / Wire-o'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.finish.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedFinish(opt.name)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition flex justify-between items-center ${
                          selectedFinish === opt.name
                            ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                            : 'border-gray-200 hover:border-[#B08968]/50 text-gray-700 bg-white'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.priceModifier ? (
                          <span className="text-[10px] text-amber-800 font-medium">
                            +{formatCurrency(opt.priceModifier)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Laminação */}
              {config.lamination?.enabled && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.lamination.label || 'Laminação da Capa'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {config.lamination.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedLamination(opt.name)}
                        className={`text-left p-2 rounded-xl border text-xs transition flex justify-between items-center ${
                          selectedLamination === opt.name
                            ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                            : 'border-gray-200 hover:border-[#B08968]/50 text-gray-700 bg-white'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.priceModifier ? (
                          <span className="text-[10px] text-amber-800 font-medium">
                            +{formatCurrency(opt.priceModifier)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Acessórios / Laço / Embalagem */}
              {config.accessories?.enabled && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.accessories.label || 'Acessórios & Embalagem'}
                  </label>
                  <div className="space-y-1.5">
                    {config.accessories.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedAccessories(opt.name)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex justify-between items-center ${
                          selectedAccessories === opt.name
                            ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                            : 'border-gray-200 hover:border-[#B08968]/50 text-gray-700 bg-white'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.priceModifier ? (
                          <span className="text-[10px] text-amber-800 font-medium">
                            +{formatCurrency(opt.priceModifier)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Corte Especial */}
              {config.specialCut?.enabled && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.specialCut.label || 'Corte Especial'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.specialCut.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedSpecialCut(opt.name)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition flex justify-between items-center ${
                          selectedSpecialCut === opt.name
                            ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                            : 'border-gray-200 hover:border-[#B08968]/50 text-gray-700 bg-white'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.priceModifier ? (
                          <span className="text-[10px] text-amber-800 font-medium">
                            +{formatCurrency(opt.priceModifier)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tema ou Paleta de Cores */}
              {config.theme?.enabled && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.theme.label || 'Tema / Estilo / Cores'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.theme.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedTheme(opt.name)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition flex justify-between items-center ${
                          selectedTheme === opt.name
                            ? 'border-[#C49A45] bg-[#F5EBDD]/60 text-[#5C4033] font-semibold'
                            : 'border-gray-200 hover:border-[#B08968]/50 text-gray-700 bg-white'
                        }`}
                      >
                        <span>{opt.name}</span>
                        {opt.priceModifier ? (
                          <span className="text-[10px] text-amber-800 font-medium">
                            +{formatCurrency(opt.priceModifier)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tipo de Impressão */}
              {config.printType?.enabled && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.printType.label || 'Tipo de Impressão'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.printType.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedPaperType(opt.name)}
                        className="text-left p-2.5 rounded-xl border text-xs transition flex justify-between items-center border-gray-200 hover:border-[#B08968]/50 text-gray-700 bg-white"
                      >
                        <span>{opt.name}</span>
                        {opt.priceModifier ? (
                          <span className="text-[10px] text-amber-800 font-medium">
                            +{formatCurrency(opt.priceModifier)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabela de Preço por Quantidade / Atacado */}
              {product.priceTiers && product.priceTiers.length > 0 && (
                <div className="p-3 bg-[#F5EBDD]/50 rounded-xl border border-[#B08968]/20 space-y-1.5">
                  <span className="text-xs font-bold text-[#5C4033] block">
                    ✨ Tabela de Descontos por Quantidade:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    {product.priceTiers.map((tier) => (
                      <div
                        key={tier.minQty}
                        className={`p-1.5 rounded-lg border text-center ${
                          quantity >= tier.minQty
                            ? 'bg-[#5C4033] text-white font-bold border-[#5C4033]'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        <div>a partir de {tier.minQty} un:</div>
                        <div className="text-[#C49A45] font-bold">
                          {formatCurrency(tier.unitPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nome ou Frase Personalizada */}
              {config.allowCustomText && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    {config.customTextLabel || 'Nome ou frase para gravação personalizada'}
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Ex: Dra. Mariana Mendes | 2026/2027"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden text-[#5C4033]"
                  />
                </div>
              )}

              {/* Upload de Imagem / Logotipo de Referência */}
              {config.allowImageUpload && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    Logotipo ou Imagem de Referência (Opcional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#5C4033] bg-[#F5EBDD] hover:bg-[#ebdcce] rounded-xl border border-[#B08968]/30 transition"
                    >
                      <Upload className="w-4 h-4 text-[#C49A45]" />
                      <span>{uploadedImagePreview ? 'Trocar Imagem' : 'Anexar Foto da Galeria'}</span>
                    </button>

                    {uploadedImagePreview && (
                      <div className="flex items-center gap-2">
                        <img
                          src={uploadedImagePreview}
                          alt="Prévia enviada"
                          className="w-9 h-9 rounded-lg object-cover border border-[#C49A45]"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImagePreview(null)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Campo para Observações */}
              {config.allowNotes && (
                <div>
                  <label className="block text-xs font-bold text-[#5C4033] mb-1.5">
                    Observações Especiais
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Algum detalhe adicional sobre cores, fonte ou embalagem que gostaria de destacar?"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden text-[#5C4033]"
                  />
                </div>
              )}

              {/* Quantity Selector */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-[#5C4033]">Quantidade</span>
                  {product.minQuantity > 1 && (
                    <span className="text-[10px] text-gray-500">Mínimo: {product.minQuantity} unidades</span>
                  )}
                </div>
                <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(product.minQuantity || 1, q - 1))}
                    disabled={quantity <= (product.minQuantity || 1)}
                    className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-[#5C4033] min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price Summary Breakdown Box */}
            <div className="p-4 bg-[#F5EBDD]/60 rounded-2xl border border-[#B08968]/30 space-y-2 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>Preço Unitário Final:</span>
                <span className="font-semibold">{formatCurrency(totalUnitPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Quantidade:</span>
                <span className="font-semibold">{quantity} un.</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#5C4033] pt-2 border-t border-[#B08968]/20">
                <span>Subtotal do Item:</span>
                <span className="text-base text-[#C49A45]">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#5C4033] hover:bg-[#432d23] text-white font-semibold text-sm rounded-full shadow-lg hover:shadow-xl transition"
              >
                <ShoppingBag className="w-4 h-4 text-[#C49A45]" />
                <span>Adicionar ao Carrinho</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppConsult}
                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-full shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
