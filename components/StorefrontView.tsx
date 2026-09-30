'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '@/lib/store-context';
import { Product } from '@/lib/types';
import { HeroBanner } from './HeroBanner';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { formatCurrency, formatPhone, createWhatsAppLink } from '@/lib/formatters';
import {
  Sparkles,
  Heart,
  Package,
  ShieldCheck,
  MessageCircle,
  SlidersHorizontal,
  ChevronDown,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface StorefrontViewProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  onOpenCart: () => void;
}

export function StorefrontView({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onOpenCart,
}: StorefrontViewProps) {
  const { products, categories, settings, setActiveTab } = useStore();
  const catalogRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sorting & Filter state
  const [sortBy, setSortBy] = useState<'recente' | 'menor_preco' | 'maior_preco'>('recente');
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.active);

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          (p.barcode && p.barcode.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Flags
    if (onlyOnSale) {
      result = result.filter((p) => p.onSale || (p.promotionalPrice && p.promotionalPrice < p.price));
    }
    if (onlyNew) {
      result = result.filter((p) => p.isNew);
    }

    // Sorting
    return result.sort((a, b) => {
      const priceA = a.promotionalPrice || a.price;
      const priceB = b.promotionalPrice || b.price;

      if (sortBy === 'menor_preco') return priceA - priceB;
      if (sortBy === 'maior_preco') return priceB - priceA;
      // recente
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, searchTerm, selectedCategory, onlyOnSale, onlyNew, sortBy]);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Carousel */}
      <HeroBanner onExploreClick={scrollToCatalog} />

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#F5EBDD]/40 rounded-3xl border border-[#B08968]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C4033] text-[#C49A45] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#5C4033]">100% Personalizado</h4>
              <p className="text-[11px] text-gray-500">Com seu nome, cores e afeto</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C4033] text-[#C49A45] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#5C4033]">Foil & Laminação Luxo</h4>
              <p className="text-[11px] text-gray-500">Acabamento refinado premium</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C4033] text-[#C49A45] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#5C4033]">Embalagem Especial</h4>
              <p className="text-[11px] text-gray-500">Pronta para presentear</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C4033] text-[#C49A45] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#5C4033]">Atendimento Direto</h4>
              <p className="text-[11px] text-gray-500">WhatsApp (99) 98181-4313</p>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Section */}
      <section ref={catalogRef} id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Section Title and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#B08968]/20 pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5C4033]">
              {activeCategoryObj ? activeCategoryObj.name : 'Catálogo de Produtos Personalizados'}
            </h2>
            <p className="text-xs text-[#B08968] font-medium mt-0.5">
              {filteredProducts.length} modelo(s) disponível(is) para personalização
            </p>
          </div>

          {/* Quick Filters & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Promo Chip */}
            <button
              onClick={() => setOnlyOnSale(!onlyOnSale)}
              className={`px-3 py-1.5 rounded-full border transition font-medium ${
                onlyOnSale
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#B08968]/40'
              }`}
            >
              Ofertas
            </button>

            {/* New Chip */}
            <button
              onClick={() => setOnlyNew(!onlyNew)}
              className={`px-3 py-1.5 rounded-full border transition font-medium ${
                onlyNew
                  ? 'bg-[#5C4033] text-white border-[#5C4033]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#B08968]/40'
              }`}
            >
              Novidades
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B08968]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-hidden font-medium text-xs text-[#5C4033]"
              >
                <option value="recente">Mais Recentes</option>
                <option value="menor_preco">Menor Preço</option>
                <option value="maior_preco">Maior Preço</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Bar if any */}
        {(selectedCategory || searchTerm || onlyOnSale || onlyNew) && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
            <span className="font-semibold text-gray-400">Filtros ativos:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5EBDD] text-[#5C4033] font-medium">
                Categoria: {activeCategoryObj?.name}
                <button onClick={() => setSelectedCategory(null)} className="hover:text-black">
                  ✕
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5EBDD] text-[#5C4033] font-medium">
                Busca: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-black">
                  ✕
                </button>
              </span>
            )}
            {(onlyOnSale || onlyNew) && (
              <button
                onClick={() => {
                  setOnlyOnSale(false);
                  setOnlyNew(false);
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#B08968]/20 shadow-xs space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F5EBDD] flex items-center justify-center text-[#B08968]">
              <Package className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#5C4033]">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Tente buscar com outras palavras-chave ou remova os filtros selecionados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
                setOnlyOnSale(false);
                setOnlyNew(false);
              }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#5C4033] text-white text-xs font-semibold rounded-full"
            >
              Ver Todos os Produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleProductSelect}
              />
            ))}
          </div>
        )}
      </section>

      {/* Custom Encomendas Banner Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-radial from-[#B08968]/20 via-[#F5EBDD] to-[#FFFDF9] border border-[#B08968]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold text-[#C49A45] uppercase tracking-wider">
              Encomendas Sob Medida
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#5C4033]">
              Não encontrou exatamente o que sonhava?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Criamos projetos especiais exclusivos para casamentos, formaturas, brindes corporativos e aniversários infantis.
              Fale diretamente com nossa artesã no WhatsApp!
            </p>
          </div>

          <a
            href={createWhatsAppLink(
              settings.whatsapp,
              'Olá! Gostaria de um orçamento personalizado para um projeto exclusivo que não encontrei na vitrine.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp ({formatPhone(settings.whatsapp)})</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#5C4033] text-[#FFFDF9] pt-12 pb-8 border-t border-[#C49A45]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10 text-xs">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <span className="font-serif text-2xl font-bold text-[#FFFDF9]">
              {settings.name}
            </span>
            <p className="text-xs text-[#F5EBDD]/80 max-w-sm leading-relaxed">
              {settings.tagline}. Ateliê especializado em papelaria afetiva, planners de capa dura, encadernações artísticas e lembrancinhas refinadas.
            </p>
            <div className="text-[11px] text-[#C49A45] pt-1">
              WhatsApp Oficial: {formatPhone(settings.whatsapp)}
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h5 className="font-bold text-[#C49A45] uppercase tracking-wider text-[11px]">
              Categorias
            </h5>
            <ul className="space-y-1 text-white/80">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.id);
                      scrollToCatalog();
                    }}
                    className="hover:text-white transition"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h5 className="font-bold text-[#C49A45] uppercase tracking-wider text-[11px]">
              Segurança & Acesso
            </h5>
            <ul className="space-y-1 text-white/80">
              <li>✓ Termos de Privacidade e LGPD</li>
              <li>✓ Produção Artesanal Sob Medida</li>
              <li>✓ Emissão Fiscal SEFAZ</li>
              <li className="pt-2">
                <button
                  onClick={() => setActiveTab('admin')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#C49A45] hover:text-white font-semibold transition"
                >
                  <Lock className="w-3 h-3" />
                  <span>Acesso do Ateliê (Painel Admin)</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#F5EBDD]/60 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} {settings.name} Papelaria Personalizada. Todos os direitos reservados.
          </div>
          <div>
            Desenvolvido com excelência técnica e design acolhedor.
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onAddedToCart={onOpenCart}
        />
      )}
    </div>
  );
}
