'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { Order, OrderStatus, OrderItem } from '@/lib/types';
import {
  formatCurrency,
  formatDateBR,
  formatDateTimeBR,
  formatPhone,
  maskCPF,
  createWhatsAppLink,
} from '@/lib/formatters';
import {
  Search,
  Filter,
  Printer,
  Edit,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  FileText,
  ChevronDown,
  X,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { ReceiptModal } from '../ReceiptModal';

const ORDER_STATUSES: OrderStatus[] = [
  'Novo',
  'Aguardando pagamento',
  'Pagamento confirmado',
  'Aguardando informações do cliente',
  'Em criação',
  'Arte enviada para aprovação',
  'Alteração solicitada',
  'Arte aprovada',
  'Em produção',
  'Pronto para retirada',
  'Enviado',
  'Concluído',
  'Cancelado',
];

interface OrdersManagerViewProps {
  initialFilter?: string;
}

export function OrdersManagerView({ initialFilter = 'todos' }: OrdersManagerViewProps) {
  const { orders, products, adminUpdateOrder, adminDeleteOrder, settings, refreshData } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [onlyOpenSalesFilter, setOnlyOpenSalesFilter] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Sync with initialFilter from dashboard navigation
  React.useEffect(() => {
    if (initialFilter === 'em_aberto') {
      setOnlyOpenSalesFilter(true);
      setSelectedStatusFilter('todos');
    } else if (initialFilter === 'faturado') {
      setOnlyOpenSalesFilter(false);
      setSelectedStatusFilter('Pagamento confirmado');
    } else {
      setOnlyOpenSalesFilter(false);
      setSelectedStatusFilter(initialFilter);
    }
  }, [initialFilter]);

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>('Novo');
  const [editStatusNote, setEditStatusNote] = useState('');
  const [editShippingFee, setEditShippingFee] = useState<number>(0);
  const [editDiscountValue, setEditDiscountValue] = useState<number>(0);
  const [editTrackingCode, setEditTrackingCode] = useState('');
  const [editInternalNotes, setEditInternalNotes] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'Pendente' | 'Confirmado' | 'Cancelado'>('Pendente');
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('PIX');
  const [editIsOpenSale, setEditIsOpenSale] = useState(false);
  const [editClientName, setEditClientName] = useState('');
  const [editClientWhatsapp, setEditClientWhatsapp] = useState('');
  const [editClientCpf, setEditClientCpf] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editShippingMethod, setEditShippingMethod] = useState<'retirada' | 'entrega' | 'correios'>('retirada');
  const [editDeliveryStreet, setEditDeliveryStreet] = useState('');
  const [editDeliveryNumber, setEditDeliveryNumber] = useState('');
  const [editDeliveryNeighborhood, setEditDeliveryNeighborhood] = useState('');
  const [editDeliveryCity, setEditDeliveryCity] = useState('');
  const [editDeliveryState, setEditDeliveryState] = useState('');
  const [editDeliveryZip, setEditDeliveryZip] = useState('');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [addItemProductId, setAddItemProductId] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Open Edit Modal
  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditStatusNote('');
    setEditShippingFee(order.shippingFee || 0);
    setEditDiscountValue(order.discountValue || 0);
    setEditTrackingCode(order.trackingCode || '');
    setEditInternalNotes(order.internalNotes || '');
    setEditPaymentStatus(order.paymentStatus);
    setEditPaymentMethod(order.paymentMethod);
    setEditIsOpenSale(!!order.isOpenSale);
    setEditClientName(order.client.name || '');
    setEditClientWhatsapp(order.client.whatsapp || '');
    setEditClientCpf(order.client.cpf || '');
    setEditClientEmail(order.client.email || '');
    setEditShippingMethod(order.shippingMethod || 'retirada');
    setEditDeliveryStreet(order.client.address?.street || '');
    setEditDeliveryNumber(order.client.address?.number || '');
    setEditDeliveryNeighborhood(order.client.address?.neighborhood || '');
    setEditDeliveryCity(order.client.address?.city || '');
    setEditDeliveryState(order.client.address?.state || '');
    setEditDeliveryZip(order.client.address?.zipCode || '');
    setEditItems(JSON.parse(JSON.stringify(order.items || [])));
    setAddItemProductId('');
  };

  const handleToggleOpenSale = async (order: Order) => {
    const newIsOpenSale = !order.isOpenSale;
    await adminUpdateOrder(
      order.id,
      { isOpenSale: newIsOpenSale },
      newIsOpenSale ? 'Marcado como Venda em Aberto' : 'Removido de Venda em Aberto'
    );
  };

  // Item editing helpers in modal
  const handleUpdateItemQty = (idx: number, delta: number) => {
    setEditItems((prev) => {
      const next = [...prev];
      const newQty = next[idx].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx);
      }
      next[idx] = {
        ...next[idx],
        quantity: newQty,
        subtotal: next[idx].unitPrice * newQty,
      };
      return next;
    });
  };

  const handleUpdateItemPrice = (idx: number, newPrice: number) => {
    setEditItems((prev) => {
      const next = [...prev];
      const validPrice = isNaN(newPrice) || newPrice < 0 ? 0 : newPrice;
      next[idx] = {
        ...next[idx],
        unitPrice: validPrice,
        subtotal: validPrice * next[idx].quantity,
      };
      return next;
    });
  };

  const handleUpdateItemCustomText = (idx: number, text: string) => {
    setEditItems((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        customizations: {
          ...next[idx].customizations,
          customText: text,
        },
      };
      return next;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setEditItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddItemToOrder = () => {
    if (!addItemProductId) return;
    const prod = products.find((p) => p.id === addItemProductId);
    if (!prod) return;
    const unitPrice = prod.promotionalPrice || prod.price;
    const qty = prod.minQuantity || 1;
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: prod.id,
      productName: prod.name,
      barcode: prod.barcode,
      photo: prod.photos[0],
      quantity: qty,
      unitPrice,
      subtotal: unitPrice * qty,
    };
    setEditItems((prev) => [...prev, newItem]);
    setAddItemProductId('');
  };

  // Dynamic calculations for Edit Modal
  const editSubtotal = editItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const editTotal = Math.max(0, editSubtotal - editDiscountValue + editShippingFee);

  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    if (editItems.length === 0) {
      alert('O pedido deve conter pelo menos um item.');
      return;
    }
    setIsSavingEdit(true);

    const updates: Partial<Order> = {
      items: editItems,
      status: editStatus,
      shippingFee: editShippingFee,
      discountValue: editDiscountValue,
      shippingMethod: editShippingMethod,
      total: editTotal,
      subtotal: editSubtotal,
      trackingCode: editTrackingCode.trim() || undefined,
      internalNotes: editInternalNotes.trim() || undefined,
      paymentStatus: editPaymentStatus,
      paymentMethod: editPaymentMethod as any,
      isOpenSale: editIsOpenSale,
      client: {
        ...editingOrder.client,
        name: editClientName.trim() || editingOrder.client.name,
        whatsapp: editClientWhatsapp.replace(/\D/g, ''),
        cpf: editClientCpf.replace(/\D/g, '') || undefined,
        email: editClientEmail.trim() || editingOrder.client.email || '',
        address:
          editShippingMethod !== 'retirada'
            ? {
                street: editDeliveryStreet.trim(),
                number: editDeliveryNumber.trim(),
                neighborhood: editDeliveryNeighborhood.trim(),
                city: editDeliveryCity.trim(),
                state: editDeliveryState.trim(),
                zipCode: editDeliveryZip.trim(),
              }
            : undefined,
      },
    };

    const success = await adminUpdateOrder(editingOrder.id, updates, editStatusNote);
    setIsSavingEdit(false);
    if (success) {
      setEditingOrder(null);
    } else {
      alert('Erro ao salvar edições do pedido.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Tem certeza que deseja excluir o pedido ${id}? Esta ação não pode ser desfeita.`)) {
      await adminDeleteOrder(id);
    }
  };

  // Export Orders to CSV
  const handleExportCSV = () => {
    const headers = [
      'Numero_Pedido',
      'Data',
      'Cliente_Nome',
      'Cliente_WhatsApp',
      'Cliente_CPF',
      'Status',
      'Venda_Em_Aberto',
      'Itens_Qtd',
      'Subtotal',
      'Desconto',
      'Frete',
      'Total',
      'Forma_Pagamento',
      'Status_Pagamento',
      'Origem',
    ];

    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.client.name}"`,
      `"${o.client.whatsapp}"`,
      `"${o.client.cpf || ''}"`,
      `"${o.status}"`,
      `"${o.isOpenSale ? 'SIM' : 'NAO'}"`,
      `"${o.items.length}"`,
      `"${o.subtotal.toFixed(2)}"`,
      `"${o.discountValue.toFixed(2)}"`,
      `"${o.shippingFee.toFixed(2)}"`,
      `"${o.total.toFixed(2)}"`,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.origin}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedidos_recriar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Orders
  const openSalesCount = orders.filter((o) => o.isOpenSale).length;

  const filteredOrders = orders.filter((o) => {
    if (onlyOpenSalesFilter && !o.isOpenSale) return false;
    const matchesStatus = selectedStatusFilter === 'todos' || o.status === selectedStatusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(term) ||
      o.client.name.toLowerCase().includes(term) ||
      o.client.whatsapp.includes(term) ||
      (o.client.email && o.client.email.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#C49A45]" />
            <span>Gestão de Pedidos & Vendas</span>
          </h2>
          <p className="text-xs text-gray-500">
            Acompanhe pedidos da vitrine e vendas presenciais, altere status, edite todos os itens e valores, e emita recibos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            title="Atualizar lista"
            className="p-2 text-gray-600 hover:text-[#5C4033] hover:bg-[#F5EBDD] rounded-xl border border-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F5EBDD] hover:bg-[#ebdcc9] text-[#5C4033] text-xs font-semibold rounded-xl border border-[#B08968]/30 shadow-xs transition"
          >
            <Download className="w-4 h-4 text-[#C49A45]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nº, cliente ou WhatsApp..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45]"
          />
        </div>

        {/* Quick Filter Buttons & Status Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOnlyOpenSalesFilter(false);
              setSelectedStatusFilter('todos');
            }}
            className={`px-3 py-2 text-xs rounded-xl font-semibold transition ${
              !onlyOpenSalesFilter && selectedStatusFilter === 'todos'
                ? 'bg-[#5C4033] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setOnlyOpenSalesFilter(!onlyOpenSalesFilter)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl font-bold transition border ${
              onlyOpenSalesFilter
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Vendas em Aberto ({openSalesCount})</span>
          </button>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#B08968] shrink-0" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setOnlyOpenSalesFilter(false);
              }}
              className="text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white text-[#5C4033] focus:ring-2 focus:ring-[#C49A45]"
            >
              <option value="todos">Status: Todos</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st} ({orders.filter((o) => o.status === st).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-[#B08968]/20 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EBDD]/60 text-[#5C4033] font-bold border-b border-[#B08968]/20">
              <tr>
                <th className="py-3 px-4">Pedido / Data</th>
                <th className="py-3 px-4">Cliente / Contato</th>
                <th className="py-3 px-4">Itens & Personalizações</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status & Venda</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Nenhum pedido encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const whatsAppMsg = `Olá, ${order.client.name.split(' ')[0]}! Aqui é da Papelaria Recriar referente ao seu pedido ${order.id}.`;
                  const waLink = createWhatsAppLink(order.client.whatsapp, whatsAppMsg);

                  return (
                    <tr key={order.id} className="hover:bg-[#FFFDF9] transition">
                      {/* Order & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#5C4033] text-sm block">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          {formatDateTimeBR(order.date)}
                        </span>
                        <span className="inline-block mt-0.5 text-[10px] uppercase font-bold text-[#B08968] bg-[#F5EBDD] px-1.5 py-0.2 rounded">
                          {order.origin === 'pdv_admin' ? 'PDV Balcão' : 'Vitrine Online'}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">{order.client.name}</span>
                        {order.client.whatsapp && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-medium"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{formatPhone(order.client.whatsapp)}</span>
                          </a>
                        )}
                        {order.client.cpf && (
                          <span className="text-[10px] text-gray-400 block">
                            CPF: {maskCPF(order.client.cpf)}
                          </span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="text-[11px] text-gray-700">
                              <span className="font-semibold text-[#5C4033]">{i.quantity}x</span> {i.productName}
                              {i.customizations?.customText && (
                                <span className="text-[#B08968] block text-[10px] italic">
                                  Gravação: "{i.customizations.customText}"
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#C49A45] text-sm block">
                          {formatCurrency(order.total)}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          {order.paymentMethod} •{' '}
                          <span
                            className={
                              order.paymentStatus === 'Confirmado'
                                ? 'text-emerald-600 font-semibold'
                                : 'text-amber-600'
                            }
                          >
                            {order.paymentStatus}
                          </span>
                        </span>
                      </td>

                      {/* Status & Venda em Aberto Toggle */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5EBDD] text-[#5C4033] border border-[#B08968]/30">
                            {order.status}
                          </span>

                          <div>
                            <button
                              type="button"
                              onClick={() => handleToggleOpenSale(order)}
                              title={order.isOpenSale ? 'Clique para desmarcar venda em aberto' : 'Clique para marcar como venda em aberto'}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                                order.isOpenSale
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                  : 'text-gray-400 hover:text-amber-800 hover:bg-amber-50 border border-dashed border-gray-300'
                              }`}
                            >
                              <span>{order.isOpenSale ? '⚠️ Venda em Aberto' : '+ Deixar em Aberto'}</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Printable Receipt for every sale */}
                          <button
                            onClick={() => setReceiptOrder(order)}
                            title="Imprimir / Visualizar Recibo"
                            className="p-1.5 rounded-lg text-[#5C4033] bg-[#F5EBDD] hover:bg-[#ebdcc9] transition"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit Sale */}
                          <button
                            onClick={() => openEditModal(order)}
                            title="Editar Pedido Completo (Itens, Valores, Status)"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold text-xs transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(order.id)}
                            title="Excluir Pedido"
                            className="p-1.5 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#B08968]/30 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#5C4033]">
                  Editar Pedido / Venda {editingOrder.id}
                </h3>
                <span className="text-xs text-gray-500">
                  Data: {formatDateTimeBR(editingOrder.date)} ({editingOrder.origin === 'pdv_admin' ? 'PDV Balcão' : 'Vitrine Online'})
                </span>
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Venda em aberto checkbox banner */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={editIsOpenSale}
                    onChange={(e) => setEditIsOpenSale(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500"
                  />
                  <span>Deixar esta venda como "Venda em Aberto" (Orçamento / Produção em Aberto)</span>
                </label>
                <p className="text-[10px] text-amber-700 pl-5 mt-0.5">
                  Vendas em aberto são facilmente filtradas e podem ter itens e valores ajustados a qualquer momento.
                </p>
              </div>

              {/* Status & Change Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Status do Pedido</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Histórico / Nota da alteração</label>
                  <input
                    type="text"
                    value={editStatusNote}
                    onChange={(e) => setEditStatusNote(e.target.value)}
                    placeholder="Ex: Arte aprovada pelo cliente / Adicionado novo item"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-[#FFFDF9] p-3.5 rounded-xl border border-[#B08968]/20 space-y-2.5">
                <h4 className="font-bold text-[#5C4033] text-xs">Dados do Cliente</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-0.5">Nome do Cliente *</label>
                    <input
                      type="text"
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-0.5">WhatsApp *</label>
                    <input
                      type="text"
                      value={editClientWhatsapp}
                      onChange={(e) => setEditClientWhatsapp(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-0.5">CPF</label>
                    <input
                      type="text"
                      value={editClientCpf}
                      onChange={(e) => setEditClientCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-gray-600 mb-0.5">E-mail</label>
                    <input
                      type="email"
                      value={editClientEmail}
                      onChange={(e) => setEditClientEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-0.5">Forma de Entrega</label>
                    <select
                      value={editShippingMethod}
                      onChange={(e) => setEditShippingMethod(e.target.value as any)}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    >
                      <option value="retirada">Retirada no Ateliê</option>
                      <option value="entrega">Entrega Local</option>
                      <option value="correios">Envio Correios / Transportadora</option>
                    </select>
                  </div>
                </div>

                {editShippingMethod !== 'retirada' && (
                  <div className="pt-2 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] text-gray-600">Rua / Logradouro</label>
                      <input
                        type="text"
                        value={editDeliveryStreet}
                        onChange={(e) => setEditDeliveryStreet(e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600">Número</label>
                      <input
                        type="text"
                        value={editDeliveryNumber}
                        onChange={(e) => setEditDeliveryNumber(e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600">Bairro</label>
                      <input
                        type="text"
                        value={editDeliveryNeighborhood}
                        onChange={(e) => setEditDeliveryNeighborhood(e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Management (Editable) */}
              <div className="bg-[#FFFDF9] p-3.5 rounded-xl border border-[#B08968]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#5C4033] text-xs">
                    Itens do Pedido ({editItems.length})
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    Edite quantidades, valores unitários ou remova itens
                  </span>
                </div>

                {/* Items Table */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {editItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-2.5 bg-white border border-gray-200 rounded-xl space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {item.photo && (
                            <img
                              src={item.photo}
                              alt=""
                              className="w-9 h-9 object-cover rounded-lg shrink-0 border"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-gray-800 line-clamp-1 block text-xs">
                              {item.productName}
                            </span>
                            {item.barcode && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                Cód: {item.barcode}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(idx, -1)}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(idx, 1)}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Unit Price */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-gray-500">R$</span>
                          <input
                            type="number"
                            step="0.50"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItemPrice(idx, parseFloat(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 text-xs border rounded text-right font-medium"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="w-20 text-right font-bold text-[#C49A45] shrink-0">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Custom text personalization */}
                      <div className="pt-1 border-t border-dashed border-gray-100 flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 shrink-0">Gravação/Texto:</span>
                        <input
                          type="text"
                          value={item.customizations?.customText || ''}
                          onChange={(e) => handleUpdateItemCustomText(idx, e.target.value)}
                          placeholder="Ex: Nome na capa / frase..."
                          className="flex-1 px-2 py-0.5 text-[11px] border border-gray-200 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Product into Order */}
                <div className="pt-2 border-t border-[#B08968]/20 flex items-center gap-2">
                  <select
                    value={addItemProductId}
                    onChange={(e) => setAddItemProductId(e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded-xl bg-white text-xs"
                  >
                    <option value="">+ Selecionar outro produto para adicionar...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatCurrency(p.promotionalPrice || p.price)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    disabled={!addItemProductId}
                    className="px-3.5 py-1.5 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-xl disabled:opacity-50 text-xs shrink-0"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Payment & Values */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Forma Pagto</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  >
                    <option value="PIX">PIX</option>
                    <option value="CartaoCredito">Cartão de Crédito</option>
                    <option value="CartaoDebito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status Pagto</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Desconto (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Taxa Frete (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={editShippingFee}
                    onChange={(e) => setEditShippingFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              {/* Tracking & Internal Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Código de Rastreamento</label>
                  <input
                    type="text"
                    value={editTrackingCode}
                    onChange={(e) => setEditTrackingCode(e.target.value)}
                    placeholder="Ex: QB123456789BR"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Notas Internas (Invisíveis ao cliente)</label>
                  <input
                    type="text"
                    value={editInternalNotes}
                    onChange={(e) => setEditInternalNotes(e.target.value)}
                    placeholder="Anotações internas do ateliê..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Order Totals Summary */}
              <div className="p-3.5 bg-[#F5EBDD]/60 rounded-xl space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal dos Itens:</span>
                  <span className="font-semibold">{formatCurrency(editSubtotal)}</span>
                </div>
                {editDiscountValue > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Desconto:</span>
                    <span>- {formatCurrency(editDiscountValue)}</span>
                  </div>
                )}
                {editShippingFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Frete / Entrega:</span>
                    <span>{formatCurrency(editShippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#5C4033] pt-1 border-t border-[#B08968]/30">
                  <span>TOTAL FINAL DO PEDIDO:</span>
                  <span className="text-base text-[#C49A45]">{formatCurrency(editTotal)}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-[#C49A45]" />
                  <span>{isSavingEdit ? 'Salvando Pedido...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recibo Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
}
