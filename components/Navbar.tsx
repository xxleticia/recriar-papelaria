'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { formatPhone, createWhatsAppLink } from '@/lib/formatters';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Lock,
  Store,
  Menu,
  X,
  Sparkles,
  Phone,
  Barcode,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
}

export function Navbar({
  onOpenCart,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
}: NavbarProps) {
  const { settings, categories, cartCount, activeTab, setActiveTab, isAdminAuthenticated } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsAppLink = createWhatsAppLink(
    settings.whatsapp,
    `Olá! Estive navegando no site da Papelaria ${settings.name} e gostaria de tirar uma dúvida sobre encomendas personalizadas.`
  );

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#B08968]/20 no-print transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#5C4033] text-[#FFFDF9] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-light tracking-wide text-amber-100/90 text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A45] shrink-0" />
            <span>{settings.announcementText}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#C49A45] transition font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: {formatPhone(settings.whatsapp)}</span>
            </a>

            <button
              onClick={() => setActiveTab(activeTab === 'vitrine' ? 'admin' : 'vitrine')}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FFFDF9] transition font-medium border border-white/20"
            >
              {activeTab === 'vitrine' ? (
                <>
                  <Lock className="w-3 h-3 text-[#C49A45]" />
                  <span>Área Administrativa</span>
                </>
              ) : (
                <>
                  <Store className="w-3 h-3 text-[#C49A45]" />
                  <span>Voltar à Vitrine</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo and Brand Name */}
        <div
          onClick={() => {
            setActiveTab('vitrine');
            setSelectedCategory(null);
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-[#C49A45]/40 shadow-xs group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#5C4033] flex items-center justify-center text-[#FFFDF9] font-serif font-bold text-xl border-2 border-[#C49A45]">
              R
            </div>
          )}
          <div>
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#5C4033] group-hover:text-[#B08968] transition-colors">
              {settings.name}
            </span>
            <span className="block text-[11px] text-[#B08968] font-medium tracking-wider uppercase">
              {settings.tagline}
            </span>
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        {activeTab === 'vitrine' && (
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B08968]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, categoria ou código de barras..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#F5EBDD]/60 border border-[#B08968]/30 rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#C49A45] focus:bg-white text-[#5C4033] placeholder:text-[#5C4033]/60 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* WhatsApp Direct Help */}
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#5C4033] bg-[#F5EBDD] hover:bg-[#ebdcc9] rounded-full border border-[#B08968]/30 transition shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Atendimento</span>
          </a>

          {/* Cart Button */}
          {activeTab === 'vitrine' && (
            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-[#5C4033] hover:bg-[#4a3429] text-white rounded-full transition shadow-md group"
              aria-label="Ver Carrinho"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold">Meu Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:static sm:ml-2 flex items-center justify-center w-5 h-5 bg-[#C49A45] text-white text-[11px] font-bold rounded-full border-2 border-white sm:border-0 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#5C4033] hover:bg-[#F5EBDD] rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {activeTab === 'vitrine' && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B08968]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produtos ou código de barras..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5EBDD]/60 border border-[#B08968]/30 rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#C49A45] text-[#5C4033]"
            />
          </div>
        </div>
      )}

      {/* Categories Horizontal Navigation Bar (Vitrine) */}
      {activeTab === 'vitrine' && (
        <nav className="border-t border-[#B08968]/15 bg-[#F5EBDD]/40 overflow-x-auto scrollbar-none py-2 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 min-w-max">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === null
                  ? 'bg-[#5C4033] text-white shadow-xs'
                  : 'text-[#5C4033] hover:bg-[#B08968]/20'
              }`}
            >
              Todos os Produtos
            </button>

            {categories
              .filter((c) => c.active)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'bg-[#5C4033] text-white shadow-xs'
                      : 'text-[#5C4033] hover:bg-[#B08968]/20'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </nav>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#B08968]/20 px-4 py-4 space-y-3">
          <div className="text-xs font-bold text-[#5C4033] uppercase tracking-wider mb-1">Categorias</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setMobileMenuOpen(false);
              }}
              className="text-left text-xs p-2 rounded-lg bg-[#F5EBDD] font-medium text-[#5C4033]"
            >
              Todos os Produtos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id);
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs p-2 rounded-lg hover:bg-[#F5EBDD] text-[#5C4033] truncate"
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
            >
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp ({formatPhone(settings.whatsapp)})
            </a>
            <button
              onClick={() => {
                setActiveTab(activeTab === 'vitrine' ? 'admin' : 'vitrine');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-[#5C4033] text-white rounded-lg"
            >
              <Lock className="w-4 h-4 text-[#C49A45]" />
              {activeTab === 'vitrine' ? 'Acessar Painel Administrativo' : 'Ir para Vitrine'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
