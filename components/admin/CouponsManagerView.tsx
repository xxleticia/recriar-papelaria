'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { Coupon } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import { Tag, Plus, Edit, Trash2, CheckCircle, Percent, Clock } from 'lucide-react';

export function CouponsManagerView() {
  const { coupons, adminAddCoupon, adminUpdateCoupon, adminDeleteCoupon } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [validTo, setValidTo] = useState('2026-12-31');
  const [active, setActive] = useState(true);

  const openNewModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percent');
    setDiscountValue(10);
    setMinOrderValue(0);
    setMaxUses(100);
    setValidTo('2026-12-31');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cp: Coupon) => {
    setEditingCoupon(cp);
    setCode(cp.code);
    setDescription(cp.description);
    setDiscountType(cp.discountType);
    setDiscountValue(cp.discountValue);
    setMinOrderValue(cp.minOrderValue || 0);
    setMaxUses(cp.maxUses || 100);
    setValidTo(cp.validTo);
    setActive(cp.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const payload: Partial<Coupon> = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue) || 10,
      minOrderValue: minOrderValue > 0 ? Number(minOrderValue) : undefined,
      maxUses: maxUses > 0 ? Number(maxUses) : undefined,
      validFrom: new Date().toISOString().split('T')[0],
      validTo,
      active,
    };

    if (editingCoupon) {
      await adminUpdateCoupon(editingCoupon.id, payload);
    } else {
      await adminAddCoupon(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, cpCode: string) => {
    if (confirm(`Deseja excluir o cupom "${cpCode}"?`)) {
      await adminDeleteCoupon(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#C49A45]" />
            <span>Cupons & Promoções</span>
          </h2>
          <p className="text-xs text-gray-500">
            Crie cupons de desconto percentuais ou em reais com regras de pedido mínimo e limite de utilização.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4 text-[#C49A45]" />
          <span>Criar Novo Cupom</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {coupons.map((cp) => (
          <div
            key={cp.id}
            className="p-5 bg-white rounded-2xl border border-[#B08968]/20 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-[#5C4033] bg-[#F5EBDD] px-2.5 py-1 rounded-lg text-sm border border-[#B08968]/30">
                  {cp.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cp.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="font-bold text-lg text-[#C49A45]">
                {cp.discountType === 'percent' ? `${cp.discountValue}% OFF` : `R$ ${cp.discountValue.toFixed(2)} OFF`}
              </div>

              <p className="text-xs text-gray-600 mt-1">{cp.description}</p>

              <div className="pt-2 text-[11px] text-gray-500 space-y-0.5 border-t border-gray-100 mt-3">
                {cp.minOrderValue && <div>• Pedido mínimo: {formatCurrency(cp.minOrderValue)}</div>}
                <div>• Utilizações: {cp.usedCount} {cp.maxUses ? `de ${cp.maxUses}` : ''}</div>
                <div>• Válido até: {cp.validTo}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                onClick={() => openEditModal(cp)}
                className="text-[#5C4033] hover:text-[#C49A45] font-semibold flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>

              <button
                onClick={() => handleDelete(cp.id, cp.code)}
                className="text-gray-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-[#B08968]/30">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-serif text-lg font-bold text-[#5C4033]">
                {editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: PROMO15"
                  className="w-full px-3 py-2 border rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: 15% de desconto para novos clientes"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Tipo de Desconto</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Valor do Desconto *</label>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Valor Mínimo Pedido (R$)</label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(parseFloat(e.target.value) || 0)}
                    placeholder="0 para sem mínimo"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Limite Total de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Validade até</label>
                <input
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-[#5C4033]"
                  />
                  <span>Cupom Ativo para uso imediato</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-xl"
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
