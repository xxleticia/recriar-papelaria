'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { formatCurrency, formatPhone } from '@/lib/formatters';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Clock,
  Cake,
  CheckCircle,
  Layers,
  Tag,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  onNavigateTab?: (tab: 'orders' | 'birthday', filter?: string) => void;
}

export function AdminDashboardOverview({ onNavigateTab }: AdminDashboardOverviewProps) {
  const { orders, products, clients, coupons, settings } = useStore();

  const [periodFilter, setPeriodFilter] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('mes');

  // Filter orders by period
  const now = new Date();
  const filteredOrders = orders.filter((o) => {
    if (periodFilter === 'todos') return true;
    const orderDate = new Date(o.date);
    if (periodFilter === 'hoje') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (periodFilter === 'semana') {
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (periodFilter === 'mes') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Metrics
  const totalSales = filteredOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = filteredOrders.length;
  const averageTicket = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;
  const openSalesCount = filteredOrders.filter((o) => o.isOpenSale).length;

  // Status counts
  const statusCounts: { [key: string]: number } = {};
  filteredOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // Top products
  const productSalesMap: { [prodName: string]: { qty: number; total: number } } = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = { qty: 0, total: 0 };
      }
      productSalesMap[item.productName].qty += item.quantity;
      productSalesMap[item.productName].total += item.subtotal;
    });
  });

  const topProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  // Check delayed orders: status is 'Em produção' or 'Em criação' and order is > 7 days old
  const delayedOrders = orders.filter((o) => {
    if (o.status === 'Concluído' || o.status === 'Cancelado') return false;
    const orderTime = new Date(o.date).getTime();
    const daysOld = (now.getTime() - orderTime) / (1000 * 60 * 60 * 24);
    return daysOld > 7;
  });

  // Birthday clients today
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const birthdayClientsToday = clients.filter((c) => {
    if (!c.birthDate || !c.birthDate.includes('/')) return false;
    const [d, m] = c.birthDate.split('/');
    return d === currentDay && m === currentMonth;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#C49A45]" />
            <span>Painel de Indicadores & Métricas</span>
          </h2>
          <p className="text-xs text-gray-500">
            Visão geral de faturamento, volume de vendas, status de produção e aniversariantes do dia.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 bg-[#F5EBDD]/60 p-1 rounded-xl border border-[#B08968]/20 text-xs">
          {(['hoje', 'semana', 'mes', 'todos'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setPeriodFilter(period)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
                periodFilter === period
                  ? 'bg-[#5C4033] text-white shadow-xs'
                  : 'text-[#5C4033] hover:bg-[#B08968]/20'
              }`}
            >
              {period === 'hoje'
                ? 'Hoje'
                : period === 'semana'
                ? 'Últimos 7 dias'
                : period === 'mes'
                ? 'Este Mês'
                : 'Todo o Período'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards (All Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faturamento */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('orders', 'faturado')}
          className="p-5 bg-white rounded-2xl border border-[#B08968]/20 shadow-xs hover:shadow-lg hover:border-[#C49A45] hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
          title="Clique para ver os pedidos faturados e vendas"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase">
              <span>Total Faturado</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C49A45] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-serif text-2xl font-bold text-[#5C4033] group-hover:text-[#C49A45] transition-colors">
              {formatCurrency(totalSales)}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">
              ✓ {totalOrdersCount} pedido(s) • Ver vendas faturadas →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F5EBDD] group-hover:bg-[#C49A45] group-hover:text-white flex items-center justify-center text-[#C49A45] transition-colors shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pedidos */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('orders', 'todos')}
          className="p-5 bg-white rounded-2xl border border-[#B08968]/20 shadow-xs hover:shadow-lg hover:border-[#C49A45] hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
          title="Clique para ver e gerenciar todos os pedidos registrados"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase">
              <span>Pedidos Registrados</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C49A45] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-serif text-2xl font-bold text-[#5C4033] group-hover:text-[#C49A45] transition-colors">
              {totalOrdersCount}
            </div>
            <span className="text-[10px] text-amber-700 font-medium block">
              {openSalesCount} venda(s) em aberto • Gerenciar todos →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F5EBDD] group-hover:bg-[#5C4033] group-hover:text-white flex items-center justify-center text-[#5C4033] transition-colors shadow-xs">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Ticket Médio */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('orders', 'todos')}
          className="p-5 bg-white rounded-2xl border border-[#B08968]/20 shadow-xs hover:shadow-lg hover:border-[#C49A45] hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
          title="Clique para conferir o histórico detalhado de pedidos e tickets"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase">
              <span>Ticket Médio</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C49A45] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-serif text-2xl font-bold text-[#5C4033] group-hover:text-[#C49A45] transition-colors">
              {formatCurrency(averageTicket)}
            </div>
            <span className="text-[10px] text-gray-500 font-medium block">
              Média por encomenda • Detalhes →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F5EBDD] group-hover:bg-[#B08968] group-hover:text-white flex items-center justify-center text-[#B08968] transition-colors shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Aniversariantes Hoje */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('birthday')}
          className="p-5 bg-white rounded-2xl border border-[#B08968]/20 shadow-xs hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
          title="Clique para abrir aniversariantes e enviar mensagens WhatsApp"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase">
              <span>Aniversariantes Hoje</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-serif text-2xl font-bold text-amber-700 group-hover:text-amber-800 transition-colors">
              {birthdayClientsToday.length}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block">
              Enviar mensagem no WhatsApp →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-amber-600 transition-colors shadow-xs">
            <Cake className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Vendas em Aberto Quick Banner (if any) */}
      {openSalesCount > 0 && (
        <div
          onClick={() => onNavigateTab && onNavigateTab('orders', 'em_aberto')}
          className="p-4 bg-amber-50 hover:bg-amber-100/90 rounded-2xl border border-amber-300 text-amber-900 flex items-center justify-between cursor-pointer transition shadow-xs group"
          title="Clique para gerenciar as vendas em aberto"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <span>Você possui {openSalesCount} venda(s) em aberto!</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-200 text-amber-900 rounded-full font-bold">
                  Orçamentos / Balcão
                </span>
              </span>
              <p className="text-[11px] text-amber-700">
                Clique aqui para filtrar diretamente e editar itens, preços ou confirmar o pagamento.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
            <span>Ver Vendas em Aberto</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Alerts & Critical Issues */}
      {delayedOrders.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">
              Atenção: Existem {delayedOrders.length} pedido(s) em aberto há mais de 7 dias!
            </span>
            <p className="mt-0.5 text-[11px] text-amber-800">
              Verifique o status da confecção ou solicite a aprovação de arte pendente com os clientes:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {delayedOrders.slice(0, 4).map((d) => (
                <span
                  key={d.id}
                  className="px-2 py-0.5 bg-white border border-amber-300 rounded font-mono font-bold"
                >
                  {d.id} ({d.client.name.split(' ')[0]} - {d.status})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Status Distribution vs Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center justify-between">
            <span>Distribuição de Pedidos por Status</span>
            <span className="text-gray-400 font-normal">Etapas de Produção</span>
          </h3>

          <div className="space-y-2">
            {Object.keys(statusCounts).length === 0 ? (
              <p className="py-8 text-center text-gray-400">Nenhum pedido registrado no período selecionado.</p>
            ) : (
              Object.entries(statusCounts).map(([statusName, count]) => {
                const percent = Math.round((count / totalOrdersCount) * 100);
                return (
                  <div key={statusName} className="space-y-1">
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-semibold">{statusName}</span>
                      <span>
                        {count} pedido(s) ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-[#5C4033] rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center justify-between">
            <span>Produtos Mais Vendidos</span>
            <span className="text-gray-400 font-normal">Volume de Faturamento</span>
          </h3>

          <div className="divide-y divide-gray-100">
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-gray-400">Nenhuma venda registrada no período.</p>
            ) : (
              topProducts.map(([name, data], idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#F5EBDD] text-[#5C4033] font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-gray-900 block">{name}</span>
                      <span className="text-[10px] text-gray-400">{data.qty} unidade(s) vendida(s)</span>
                    </div>
                  </div>

                  <span className="font-bold text-[#C49A45]">{formatCurrency(data.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
