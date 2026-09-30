'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { formatCurrency } from '@/lib/formatters';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onProceedToCheckout }: CartDrawerProps) {
  const {
    cart,
    cartSubtotal,
    removeFromCart,
    updateCartItemQty,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isOpen) return null;

  const discountValue = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountValue);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);

    const result = await applyCoupon(couponCodeInput.trim());
    if (result.success) {
      setCouponMessage({ text: result.message, isError: false });
      setCouponCodeInput('');
    } else {
      setCouponMessage({ text: result.message, isError: true });
    }
    setIsApplyingCoupon(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#B08968]/20">
          {/* Header */}
          <div className="px-6 py-5 bg-[#F5EBDD] border-b border-[#B08968]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#5C4033]" />
              <h2 className="font-serif text-lg font-bold text-[#5C4033]">Seu Carrinho</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#5C4033] text-white">
                {cart.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-black/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F5EBDD] flex items-center justify-center text-[#B08968]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif text-base font-semibold text-[#5C4033]">Seu carrinho está vazio</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore nossos planners, cadernos e lembrancinhas personalizadas na vitrine!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#5C4033] text-white text-xs font-semibold rounded-full shadow-xs hover:bg-[#432d23] transition"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-3 p-3.5 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD] shadow-xs relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.photos[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#B08968]/20 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-[#5C4033] truncate">{item.product.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-gray-400 hover:text-red-600 transition p-0.5"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Selected Customizations summary */}
                    <div className="text-[11px] text-gray-500 space-y-0.5 leading-tight">
                      {item.customizations.format && (
                        <div>• Formato: <span className="text-gray-700">{item.customizations.format}</span></div>
                      )}
                      {item.customizations.paperType && (
                        <div>• Papel: <span className="text-gray-700">{item.customizations.paperType}</span></div>
                      )}
                      {item.customizations.finish && (
                        <div>• Acabamento: <span className="text-gray-700">{item.customizations.finish}</span></div>
                      )}
                      {item.customizations.customText && (
                        <div className="text-[#B08968] font-medium">
                          • Gravação: "{item.customizations.customText}"
                        </div>
                      )}
                      {item.customerUploadedImage && (
                        <div className="text-emerald-700 font-medium">✓ Imagem de referência anexada</div>
                      )}
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className="flex items-center justify-between pt-1.5">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateCartItemQty(item.cartItemId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#5C4033]">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQty(item.cartItemId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#C49A45]">
                          {formatCurrency(item.totalUnitPrice * item.quantity)}
                        </span>
                        <span className="block text-[10px] text-gray-400">
                          {formatCurrency(item.totalUnitPrice)}/un
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#F5EBDD]/60 border-t border-[#B08968]/20 space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Cupom de desconto"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] uppercase text-[#5C4033]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCodeInput}
                    className="px-4 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    {isApplyingCoupon ? '...' : 'Aplicar'}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Cupom <strong>{appliedCoupon.coupon.code}</strong> aplicado (-{formatCurrency(appliedCoupon.discountAmount)})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-500 hover:underline text-[11px]"
                    >
                      Remover
                    </button>
                  </div>
                )}

                {couponMessage && couponMessage.isError && (
                  <div className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {couponMessage.text}
                  </div>
                )}
              </form>

              {/* Subtotals & Total */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(cartSubtotal)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Desconto do Cupom:</span>
                    <span>- {formatCurrency(discountValue)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#5C4033] pt-2 border-t border-[#B08968]/20">
                  <span>Total Estimado:</span>
                  <span className="text-base text-[#C49A45]">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#5C4033] hover:bg-[#432d23] text-white font-semibold text-sm rounded-full shadow-lg hover:shadow-xl transition"
              >
                <span>Fechar Pedido</span>
                <ArrowRight className="w-4 h-4 text-[#C49A45]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
