'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { Category } from '@/lib/types';
import { Plus, Edit, Trash2, Folder, Layers, Check, X, Search } from 'lucide-react';

export function CategoriesManagerView() {
  const { categories, products, adminAddCategory, adminUpdateCategory, adminDeleteCategory } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [active, setActive] = useState(true);

  const openNewModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Folder');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Folder');
    setActive(cat.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      await adminUpdateCategory(editingCategory.id, {
        name: name.trim(),
        description: description.trim(),
        icon,
        active,
      });
    } else {
      await adminAddCategory({
        name: name.trim(),
        description: description.trim(),
        icon,
        active,
        order: categories.length + 1,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    const count = products.filter((p) => p.categoryId === id).length;
    const msg =
      count > 0
        ? `A categoria "${catName}" possui ${count} produto(s) associado(s). Tem certeza que deseja excluí-la?`
        : `Deseja realmente excluir a categoria "${catName}"?`;

    if (confirm(msg)) {
      await adminDeleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <Folder className="w-6 h-6 text-[#C49A45]" />
            <span>Gerenciador de Categorias</span>
          </h2>
          <p className="text-xs text-gray-500">
            Adicione novas categorias para organizar sua vitrine, edite nomes e descrições ou remova categorias obsoletas.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5C4033] hover:bg-[#432d23] text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4 text-[#C49A45]" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Search and Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoria por nome ou descrição..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45]"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
          {categories.filter((c) => c.active).length} ativas na vitrine • {categories.length} total
        </span>
      </div>

      {/* Categories Cards / Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories
          .filter(
            (c) =>
              c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((cat) => {
          const productCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-4 bg-white rounded-2xl border border-[#B08968]/20 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-[#F5EBDD] text-[#5C4033]">
                    <Folder className="w-5 h-5 text-[#C49A45]" />
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.active ? 'Ativa na vitrine' : 'Oculta'}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-[#5C4033] text-base">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description || 'Sem descrição'}</p>
                <span className="text-[11px] text-[#B08968] font-medium block mt-2">
                  {productCount} produto(s) vinculado(s)
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(cat)}
                  className="inline-flex items-center gap-1 text-xs text-[#5C4033] hover:text-[#C49A45] font-semibold"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition"
                  title="Excluir Categoria"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-[#B08968]/30">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-serif text-lg font-bold text-[#5C4033]">
                {editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Caixas Cartonadas & Luxo"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Descrição Breve</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição amigável para a vitrine..."
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
                  <span>Exibir na barra de navegação da vitrine</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-xl shadow-xs transition"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
