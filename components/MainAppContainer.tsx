'use client';

import React, { useState } from 'react';
import { StoreProvider, useStore } from '@/lib/store-context';
import { Navbar } from '@/components/Navbar';
import { StorefrontView } from '@/components/StorefrontView';
import { AdminContainer } from '@/components/admin/AdminContainer';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';

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
