'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { formatCurrency, createWhatsAppLink } from '@/lib/formatters';
import { useStore } from '@/lib/store-context';
import { Clock, MessageCircle, Sparkles, Layers, Barcode, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const { settings, categories } = useStore();
  const category = categories.find((c) => c.id === product.categoryId);

  const mainPhoto = product.photos[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
  const hasPromo = product.promotionalPrice && product.promotionalPrice < product.price;
  const currentPrice = hasPromo ? product.promotionalPrice! : product.price;

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = createWhatsAppLink(
      settings.whatsapp,
      `Olá! Tenho interesse no produto "${product.name}" (Cód: ${product.barcode || product.sku}). Gostaria de tirar algumas dúvidas sobre personalização!`
    );
    window.open(link, '_blank');
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#B08968]/20 shadow-xs hover:shadow-xl hover:border-[#C49A45]/40 transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F5EBDD]/40">
        <img
          src={mainPhoto}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C49A45] text-white shadow-xs">
              Novo
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5C4033] text-white shadow-xs">
              Destaque
            </span>
          )}
          {hasPromo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
              Oferta
            </span>
          )}
        </div>

        {/* Barcode Tag (top right) */}
        {product.barcode && (
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
            <Barcode className="w-3 h-3 text-[#C49A45]" />
            <span>{product.barcode}</span>
          </div>
        )}

        {/* Production Time badge */}
        <div className="absolute bottom-2 left-2.5 bg-white/90 backdrop-blur-xs text-[#5C4033] text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
          <Clock className="w-3 h-3 text-[#B08968]" />
          <span>Produção: ~{product.estimatedDays} dias</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {category && (
            <span className="text-[11px] font-semibold text-[#B08968] uppercase tracking-wider block mb-1">
              {category.name}
            </span>
          )}
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#5C4033] group-hover:text-[#B08968] transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Min Quantity */}
        <div className="pt-2 border-t border-[#F5EBDD] space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-medium">A partir de</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-bold text-[#5C4033]">
                  {formatCurrency(currentPrice)}
                </span>
                {hasPromo && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
            </div>

            {product.minQuantity > 1 && (
              <span className="text-[11px] text-[#B08968] bg-[#F5EBDD] px-2 py-0.5 rounded-full font-medium">
                Mínimo {product.minQuantity} un.
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            <button
              onClick={() => onSelect(product)}
              className="col-span-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#5C4033] hover:bg-[#432d23] text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <span>Personalizar & Comprar</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C49A45]" />
            </button>

            <button
              onClick={handleWhatsAppInquiry}
              title="Tirar dúvidas no WhatsApp"
              className="col-span-1 flex items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
