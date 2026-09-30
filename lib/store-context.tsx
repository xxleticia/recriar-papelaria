'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Category,
  ClientData,
  Coupon,
  Order,
  Product,
  SelectedCustomizations,
  StoreSettings,
} from './types';
import {
  initialCategories,
  initialClients,
  initialCoupons,
  initialOrders,
  initialProducts,
  initialStoreSettings,
} from './mock-data';

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  additionalCost: number;
  totalUnitPrice: number;
  customizations: SelectedCustomizations;
  notes?: string;
  customerUploadedImage?: string;
}

interface StoreContextType {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  clients: ClientData[];
  coupons: Coupon[];
  auditLogs: any[];
  isLoading: boolean;
  isAdminAuthenticated: boolean;
  adminUsername: string | null;
  isTemporaryPassword: boolean;
  activeTab: 'vitrine' | 'admin';
  setActiveTab: (tab: 'vitrine' | 'admin') => void;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  appliedCoupon: { coupon: Coupon; discountAmount: number } | null;
  addToCart: (
    product: Product,
    quantity: number,
    customizations: SelectedCustomizations,
    customerUploadedImage?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQty: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>;
  removeCoupon: () => void;

  // Actions
  placeOrder: (orderPayload: Partial<Order>) => Promise<{ success: boolean; order?: Order; error?: string }>;
  adminUpdateOrder: (id: string, updates: Partial<Order>, note?: string) => Promise<boolean>;
  adminDeleteOrder: (id: string) => Promise<boolean>;
  adminAddProduct: (product: Partial<Product>) => Promise<boolean>;
  adminUpdateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  adminDeleteProduct: (id: string) => Promise<boolean>;
  adminAddCategory: (category: Partial<Category>) => Promise<boolean>;
  adminUpdateCategory: (id: string, updates: Partial<Category>) => Promise<boolean>;
  adminDeleteCategory: (id: string) => Promise<boolean>;
  adminAddClient: (client: Partial<ClientData>) => Promise<boolean>;
  adminUpdateClient: (id: string, updates: Partial<ClientData>, action?: string) => Promise<boolean>;
  adminDeleteClient: (id: string) => Promise<boolean>;
  adminAddCoupon: (coupon: Partial<Coupon>) => Promise<boolean>;
  adminUpdateCoupon: (id: string, updates: Partial<Coupon>) => Promise<boolean>;
  adminDeleteCoupon: (id: string) => Promise<boolean>;
  adminUpdateSettings: (settingsUpdates: Partial<StoreSettings>) => Promise<boolean>;

  // Auth
  adminLogin: (user: string, pass: string) => Promise<{ success: boolean; error?: string; isTemp?: boolean }>;
  adminLogout: () => Promise<void>;
  adminChangePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [clients, setClients] = useState<ClientData[]>(initialClients);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auth & view state
  const [activeTab, setActiveTab] = useState<'vitrine' | 'admin'>('vitrine');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [isTemporaryPassword, setIsTemporaryPassword] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: Coupon; discountAmount: number } | null>(null);

  // Check auth in localStorage
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('recriar_admin_logged');
      if (savedAuth === 'true') {
        setIsAdminAuthenticated(true);
        setAdminUsername(localStorage.getItem('recriar_admin_user') || 'Recriar');
      }
      const savedCart = localStorage.getItem('recriar_client_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {}
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('recriar_client_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Load state from backend on mount
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.categories) setCategories(data.categories);
        if (data.products) setProducts(data.products);
        if (data.orders) setOrders(data.orders);
        if (data.clients) setClients(data.clients);
        if (data.coupons) setCoupons(data.coupons);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.adminStatus) {
          setIsTemporaryPassword(data.adminStatus.isTemporaryPassword);
        }
      }
    } catch (e) {
      console.warn('Usando dados em memória/cache:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Poll updates every 15 seconds so storefront and admin sync automatically
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Cart Computations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.totalUnitPrice * item.quantity, 0);

  const addToCart = (
    product: Product,
    quantity: number,
    customizations: SelectedCustomizations,
    customerUploadedImage?: string
  ) => {
    // Calculate additional cost from customizations
    let additionalCost = 0;
    const config = product.customizationConfig;

    if (customizations.format && config.format) {
      const opt = config.format.options.find((o) => o.name === customizations.format);
      if (opt?.priceModifier) additionalCost += opt.priceModifier;
    }
    if (customizations.paperType && config.paperType) {
      const opt = config.paperType.options.find((o) => o.name === customizations.paperType);
      if (opt?.priceModifier) additionalCost += opt.priceModifier;
    }
    if (customizations.finish && config.finish) {
      const opt = config.finish.options.find((o) => o.name === customizations.finish);
      if (opt?.priceModifier) additionalCost += opt.priceModifier;
    }
    if (customizations.lamination && config.lamination) {
      const opt = config.lamination.options.find((o) => o.name === customizations.lamination);
      if (opt?.priceModifier) additionalCost += opt.priceModifier;
    }
    if (customizations.specialCut && config.specialCut) {
      const opt = config.specialCut.options.find((o) => o.name === customizations.specialCut);
      if (opt?.priceModifier) additionalCost += opt.priceModifier;
    }
    if (customizations.accessories && config.accessories) {
      const opt = config.accessories.options.find((o) => o.name === customizations.accessories);
      if (opt?.priceModifier) additionalCost += opt.priceModifier;
    }

    // Check tier pricing based on quantity
    let baseUnitPrice = product.promotionalPrice && product.promotionalPrice > 0 ? product.promotionalPrice : product.price;
    if (product.priceTiers && product.priceTiers.length > 0) {
      const applicableTier = [...product.priceTiers]
        .sort((a, b) => b.minQty - a.minQty)
        .find((t) => quantity >= t.minQty);
      if (applicableTier) {
        baseUnitPrice = applicableTier.unitPrice;
      }
    }

    const totalUnitPrice = Math.max(0, baseUnitPrice + additionalCost);

    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product,
      quantity,
      unitPrice: baseUnitPrice,
      additionalCost,
      totalUnitPrice,
      customizations,
      notes: customizations.notes,
      customerUploadedImage,
    };

    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateCartItemQty = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          // Re-evaluate tier pricing if exists
          let basePrice = item.unitPrice;
          if (item.product.priceTiers && item.product.priceTiers.length > 0) {
            const applicableTier = [...item.product.priceTiers]
              .sort((a, b) => b.minQty - a.minQty)
              .find((t) => quantity >= t.minQty);
            if (applicableTier) {
              basePrice = applicableTier.unitPrice;
            } else {
              basePrice = item.product.promotionalPrice || item.product.price;
            }
          }
          const totalUnitPrice = basePrice + item.additionalCost;
          return {
            ...item,
            quantity,
            unitPrice: basePrice,
            totalUnitPrice,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}&total=${cartSubtotal}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { success: false, message: data.error || 'Cupom inválido.' };
      }
      setAppliedCoupon({ coupon: data.coupon, discountAmount: data.discountAmount });
      return {
        success: true,
        message: `Cupom ${data.coupon.code} aplicado com sucesso! Desconto de R$ ${data.discountAmount.toFixed(2)}`,
        discount: data.discountAmount,
      };
    } catch {
      return { success: false, message: 'Erro ao validar cupom.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Place order
  const placeOrder = async (orderPayload: Partial<Order>) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Immediately add to orders in context
        setOrders((prev) => [data.order, ...prev]);
        clearCart();
        refreshData();
        return { success: true, order: data.order };
      }
      return { success: false, error: data.error || 'Erro ao registrar pedido' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Falha de conexão com o servidor' };
    }
  };

  // Admin order update (all sales editable)
  const adminUpdateOrder = async (id: string, updates: Partial<Order>, note?: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates, statusChangeNote: note }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Products
  const adminAddProduct = async (product: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => [data.product, ...prev]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Categories
  const adminAddCategory = async (cat: Partial<Category>) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => [...prev, data.category]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === id ? data.category : c)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Clients
  const adminAddClient = async (client: Partial<ClientData>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      if (res.ok) {
        const data = await res.json();
        setClients((prev) => [data.client, ...prev]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminUpdateClient = async (id: string, updates: Partial<ClientData>, action?: string) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates, action }),
      });
      if (res.ok) {
        refreshData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminDeleteClient = async (id: string) => {
    try {
      const res = await fetch(`/api/clients?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Coupons
  const adminAddCoupon = async (coupon: Partial<Coupon>) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) => [...prev, data.coupon]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminUpdateCoupon = async (id: string, updates: Partial<Coupon>) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) => prev.map((cp) => (cp.id === id ? data.coupon : cp)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const adminDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons((prev) => prev.filter((cp) => cp.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Settings
  const adminUpdateSettings = async (settingsUpdates: Partial<StoreSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsUpdates),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Auth
  const adminLogin = async (user: string, pass: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username: user, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        setAdminUsername(data.username);
        setIsTemporaryPassword(data.isTemporaryPassword);
        localStorage.setItem('recriar_admin_logged', 'true');
        localStorage.setItem('recriar_admin_user', data.username);
        return { success: true, isTemp: data.isTemporaryPassword };
      }
      return { success: false, error: data.error || 'Credenciais inválidas' };
    } catch {
      return { success: false, error: 'Falha na conexão com o servidor' };
    }
  };

  const adminLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } finally {
      setIsAdminAuthenticated(false);
      setAdminUsername(null);
      localStorage.removeItem('recriar_admin_logged');
      localStorage.removeItem('recriar_admin_user');
      setActiveTab('vitrine');
    }
  };

  const adminChangePassword = async (oldPass: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', password: oldPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsTemporaryPassword(false);
        return { success: true };
      }
      return { success: false, error: data.error || 'Erro ao alterar senha' };
    } catch {
      return { success: false, error: 'Falha ao conectar com o servidor' };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        products,
        orders,
        clients,
        coupons,
        auditLogs,
        isLoading,
        isAdminAuthenticated,
        adminUsername,
        isTemporaryPassword,
        activeTab,
        setActiveTab,
        cart,
        cartCount,
        cartSubtotal,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        clearCart,
        applyCoupon,
        removeCoupon,
        placeOrder,
        adminUpdateOrder,
        adminDeleteOrder,
        adminAddProduct,
        adminUpdateProduct,
        adminDeleteProduct,
        adminAddCategory,
        adminUpdateCategory,
        adminDeleteCategory,
        adminAddClient,
        adminUpdateClient,
        adminDeleteClient,
        adminAddCoupon,
        adminUpdateCoupon,
        adminDeleteCoupon,
        adminUpdateSettings,
        adminLogin,
        adminLogout,
        adminChangePassword,
        refreshData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
