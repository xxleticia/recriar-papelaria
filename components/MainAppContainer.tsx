'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { StoreProvider, useStore } from '@/lib/store-context';
import { Navbar } from '@/components/Navbar';
import { StorefrontView } from '@/components/StorefrontView';

// Dynamic imports to keep initial storefront chunk tiny and avoid script timeouts
const AdminContainer = dynamic(
  () => import('@/components/admin/AdminContainer').then((mod) => mod.AdminContainer),
  {
    loading: () => (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#5C4033] p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C49A45] mb-3" />
        <span className="text-sm font-medium">Carregando painel de gestão...</span>
      </div>
    ),
    ssr: false,
  }
);

const CartDrawer = dynamic(
  () => import('@/components/CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false }
);

const CheckoutModal = dynamic(
  () => import('@/components/CheckoutModal').then((mod) => mod.CheckoutModal),
  { ssr: false }
);

function MainApp() {
  const { activeTab } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#5C4033]">
      {/* Universal Navigation */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Content Area: Vitrine or Admin */}
      <main className="flex-1">
        {activeTab === 'vitrine' ? (
          <StorefrontView
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onOpenCart={() => setIsCartOpen(true)}
          />
        ) : (
          <AdminContainer />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}

export function MainAppContainer() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
