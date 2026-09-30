'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { AdminLoginView } from './AdminLoginView';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { PdvSalesView } from './PdvSalesView';
import { OrdersManagerView } from './OrdersManagerView';
import { ProductsManagerView } from './ProductsManagerView';
import { CategoriesManagerView } from './CategoriesManagerView';
import { ClientsManagerView } from './ClientsManagerView';
import { PricingCalculatorView } from './PricingCalculatorView';
import { CouponsManagerView } from './CouponsManagerView';
import { BirthdayMessagesView } from './BirthdayMessagesView';
import { FiscalManagerView } from './FiscalManagerView';
import { StoreSettingsView } from './StoreSettingsView';
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Layers,
  Folder,
  Users,
  Calculator,
  Tag,
  Cake,
  FileCheck,
  Palette,
  LogOut,
  Store,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export function AdminContainer() {
  const {
    isAdminAuthenticated,
    adminUsername,
    adminLogout,
    setActiveTab,
    settings,
  } = useStore();

  type AdminSubTab =
    | 'dashboard'
    | 'pdv'
    | 'orders'
    | 'products'
    | 'categories'
    | 'clients'
    | 'pricing'
    | 'coupons'
    | 'birthday'
    | 'fiscal'
    | 'settings';

  const [currentTab, setCurrentTab] = useState<AdminSubTab>('dashboard');
  const [ordersFilter, setOrdersFilter] = useState<string>('todos');

  const handleNavigateTab = (tab: AdminSubTab, filter?: string) => {
    setCurrentTab(tab);
    if (filter) {
      setOrdersFilter(filter);
    }
  };

  if (!isAdminAuthenticated) {
    return <AdminLoginView />;
  }

  const menuItems: { id: AdminSubTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'pdv', label: 'PDV Balcão & Leitor', icon: ShoppingBag, badge: 'Venda Rápida' },
    { id: 'orders', label: 'Pedidos & Vendas', icon: FileText },
    { id: 'products', label: 'Produtos & Galeria', icon: Layers },
    { id: 'categories', label: 'Categorias', icon: Folder },
    { id: 'clients', label: 'Clientes & LGPD', icon: Users },
    { id: 'pricing', label: 'Calculadora & Manual', icon: Calculator },
    { id: 'coupons', label: 'Cupons & Promoções', icon: Tag },
    { id: 'birthday', label: 'Aniversários WhatsApp', icon: Cake },
    { id: 'fiscal', label: 'Módulo Fiscal', icon: FileCheck },
    { id: 'settings', label: 'Identidade & Loja', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] pb-16">
      {/* Admin Top Header */}
      <div className="bg-[#5C4033] text-white py-3.5 px-4 sm:px-6 shadow-md border-b border-[#C49A45]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt=""
                className="w-9 h-9 rounded-xl object-cover border border-[#C49A45]"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#C49A45] flex items-center justify-center font-serif font-bold text-white">
                R
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl text-[#FFFDF9]">
                  {settings.name} Admin
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C49A45] text-white">
                  Ateliê Conectado
                </span>
              </div>
              <span className="text-[11px] text-[#F5EBDD]/80 block">
                Operador: <strong>{adminUsername || 'Recriar'}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <button
              onClick={() => setActiveTab('vitrine')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#FFFDF9] rounded-xl border border-white/20 transition font-medium"
            >
              <Store className="w-3.5 h-3.5 text-[#C49A45]" />
              <span className="hidden sm:inline">Ver Vitrine do Cliente</span>
              <span className="sm:hidden">Vitrine</span>
            </button>

            <button
              onClick={adminLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-xl transition font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Horizontal Subnavigation Bar */}
      <div className="bg-white border-b border-[#B08968]/20 sticky top-0 z-30 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 min-w-max py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                  isActive
                    ? 'bg-[#5C4033] text-white shadow-xs'
                    : 'text-[#5C4033] hover:bg-[#F5EBDD]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C49A45]' : 'text-[#B08968]'}`} />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="text-[9px] bg-[#C49A45]/20 text-[#5C4033] px-1.5 py-0.2 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {currentTab === 'dashboard' && <AdminDashboardOverview onNavigateTab={handleNavigateTab} />}
        {currentTab === 'pdv' && <PdvSalesView />}
        {currentTab === 'orders' && <OrdersManagerView initialFilter={ordersFilter} />}
        {currentTab === 'products' && <ProductsManagerView />}
        {currentTab === 'categories' && <CategoriesManagerView />}
        {currentTab === 'clients' && <ClientsManagerView />}
        {currentTab === 'pricing' && <PricingCalculatorView />}
        {currentTab === 'coupons' && <CouponsManagerView />}
        {currentTab === 'birthday' && <BirthdayMessagesView />}
        {currentTab === 'fiscal' && <FiscalManagerView />}
        {currentTab === 'settings' && <StoreSettingsView />}
      </main>
    </div>
  );
}
