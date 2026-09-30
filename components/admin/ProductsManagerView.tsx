'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/lib/store-context';
import { Product, CustomizationFieldConfig, CustomizationOptionItem, PriceTier } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Barcode,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Layers,
  Sparkles,
  Search,
  ArrowUp,
  ArrowDown,
  Settings,
} from 'lucide-react';

export function ProductsManagerView() {
  const {
    products,
    categories,
    adminAddProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    adminAddCategory,
    adminUpdateCategory,
    adminDeleteCategory,
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Inline Category Management State (inside product registration)
  const [showInlineCatModal, setShowInlineCatModal] = useState<'new' | 'edit' | 'manage' | null>(null);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatDesc, setInlineCatDesc] = useState('');
  const [inlineCatActive, setInlineCatActive] = useState(true);
  const [editingInlineCatId, setEditingInlineCatId] = useState<string | null>(null);
  const [isSavingInlineCat, setIsSavingInlineCat] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [promotionalPrice, setPromotionalPrice] = useState<number | null>(null);
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [estimatedDays, setEstimatedDays] = useState<number>(5);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [active, setActive] = useState(true);
  const [isSobEncomenda, setIsSobEncomenda] = useState(true);
  const [stock, setStock] = useState<number | null>(null);

  // Customization Options configured by admin for this product
  const [enableFormat, setEnableFormat] = useState(true);
  const [formatOptions, setFormatOptions] = useState<CustomizationOptionItem[]>([
    { id: 'f-1', name: 'A5 (15x21 cm)', priceModifier: 0 },
    { id: 'f-2', name: 'Colegial (18x24 cm)', priceModifier: 15.0 },
  ]);

  const [enablePaper, setEnablePaper] = useState(true);
  const [paperOptions, setPaperOptions] = useState<CustomizationOptionItem[]>([
    { id: 'p-1', name: 'Offset 90g', priceModifier: 0 },
    { id: 'p-2', name: 'Offset 120g Especial', priceModifier: 10.0 },
  ]);

  const [enableFinish, setEnableFinish] = useState(true);
  const [finishOptions, setFinishOptions] = useState<CustomizationOptionItem[]>([
    { id: 'w-1', name: 'Wire-o Metálico Dourado', priceModifier: 0 },
    { id: 'w-2', name: 'Wire-o Metálico Bronze', priceModifier: 0 },
  ]);

  const [enableLamination, setEnableLamination] = useState(true);
  const [laminationOptions, setLaminationOptions] = useState<CustomizationOptionItem[]>([
    { id: 'l-1', name: 'Fosca Aveludada', priceModifier: 0 },
    { id: 'l-2', name: 'Holográfica Estrelinhas', priceModifier: 6.0 },
  ]);

  const [enableAccessories, setEnableAccessories] = useState(false);
  const [accessoryOptions, setAccessoryOptions] = useState<CustomizationOptionItem[]>([
    { id: 'a-1', name: 'Laço Chanel em Cetim', priceModifier: 3.5 },
    { id: 'a-2', name: 'Cantoneiras Douradas', priceModifier: 7.0 },
  ]);

  const [enableSpecialCut, setEnableSpecialCut] = useState(false);
  const [specialCutOptions, setSpecialCutOptions] = useState<CustomizationOptionItem[]>([
    { id: 'sc-1', name: 'Corte Reto Tradicional', priceModifier: 0 },
    { id: 'sc-2', name: 'Cantos Arredondados', priceModifier: 2.0 },
    { id: 'sc-3', name: 'Corte e Vinco Especial', priceModifier: 5.0 },
  ]);

  const [enableTheme, setEnableTheme] = useState(false);
  const [themeOptions, setThemeOptions] = useState<CustomizationOptionItem[]>([
    { id: 'th-1', name: 'Floral Vintage', priceModifier: 0 },
    { id: 'th-2', name: 'Minimalista & Linho', priceModifier: 0 },
    { id: 'th-3', name: 'Rose Gold & Dourado', priceModifier: 4.0 },
  ]);

  const [enablePrintType, setEnablePrintType] = useState(false);
  const [printTypeOptions, setPrintTypeOptions] = useState<CustomizationOptionItem[]>([
    { id: 'pt-1', name: 'Jato de Tinta Pigmentada HD', priceModifier: 0 },
    { id: 'pt-2', name: 'Impressão Laser Profissional', priceModifier: 3.0 },
  ]);

  const [allowCustomText, setAllowCustomText] = useState(true);
  const [customTextLabel, setCustomTextLabel] = useState('Nome ou Frase personalizada');
  const [allowImageUpload, setAllowImageUpload] = useState(true);
  const [allowNotes, setAllowNotes] = useState(true);

  // Price Tiers / Atacado
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [newTierMinQty, setNewTierMinQty] = useState<number>(10);
  const [newTierPrice, setNewTierPrice] = useState<number>(0);

  // New option helper inputs
  const [newOptName, setNewOptName] = useState('');
  const [newOptPrice, setNewOptPrice] = useState<number>(0);
  const [targetConfigField, setTargetConfigField] = useState<
    'format' | 'paper' | 'finish' | 'lamination' | 'accessory' | 'specialCut' | 'theme' | 'printType'
  >('format');

  const openNewProductModal = () => {
    setEditingProductId(null);
    setName('');
    setSku(`REC-${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcode(String(7891000000000 + Math.floor(Math.random() * 1000000)));
    setCategoryId(categories[0]?.id || 'cat-1');
    setDescription('');
    setPrice(49.9);
    setPromotionalPrice(null);
    setMinQuantity(1);
    setEstimatedDays(5);
    setPhotos(['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80']);
    setIsNew(true);
    setIsFeatured(false);
    setOnSale(false);
    setActive(true);
    setIsSobEncomenda(true);
    setStock(null);
    setPriceTiers([]);
    setEnableFormat(true);
    setEnablePaper(true);
    setEnableFinish(true);
    setEnableLamination(true);
    setEnableAccessories(false);
    setEnableSpecialCut(false);
    setEnableTheme(false);
    setEnablePrintType(false);
    setAllowCustomText(true);
    setCustomTextLabel('Nome ou Frase personalizada');
    setAllowImageUpload(true);
    setAllowNotes(true);
    setIsModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setSku(prod.sku);
    setBarcode(prod.barcode || '');
    setCategoryId(prod.categoryId);
    setDescription(prod.description);
    setPrice(prod.price);
    setPromotionalPrice(prod.promotionalPrice || null);
    setMinQuantity(prod.minQuantity);
    setEstimatedDays(prod.estimatedDays);
    setPhotos([...prod.photos]);
    setIsNew(!!prod.isNew);
    setIsFeatured(!!prod.isFeatured);
    setOnSale(!!prod.onSale);
    setActive(prod.active);
    setIsSobEncomenda(prod.stock === null || prod.stock === undefined);
    setStock(prod.stock || null);
    setPriceTiers(prod.priceTiers || []);

    // Customization config
    const cfg = prod.customizationConfig || {};
    setEnableFormat(!!cfg.format?.enabled);
    setFormatOptions(cfg.format?.options || []);
    setEnablePaper(!!cfg.paperType?.enabled);
    setPaperOptions(cfg.paperType?.options || []);
    setEnableFinish(!!cfg.finish?.enabled);
    setFinishOptions(cfg.finish?.options || []);
    setEnableLamination(!!cfg.lamination?.enabled);
    setLaminationOptions(cfg.lamination?.options || []);
    setEnableAccessories(!!cfg.accessories?.enabled);
    setAccessoryOptions(cfg.accessories?.options || []);
    setEnableSpecialCut(!!cfg.specialCut?.enabled);
    setSpecialCutOptions(cfg.specialCut?.options || []);
    setEnableTheme(!!cfg.theme?.enabled);
    setThemeOptions(cfg.theme?.options || []);
    setEnablePrintType(!!cfg.printType?.enabled);
    setPrintTypeOptions(cfg.printType?.options || []);

    setAllowCustomText(cfg.allowCustomText !== false);
    setCustomTextLabel(cfg.customTextLabel || 'Nome ou frase personalizada');
    setAllowImageUpload(cfg.allowImageUpload !== false);
    setAllowNotes(cfg.allowNotes !== false);

    setIsModalOpen(true);
  };

  // Add photo from user's gallery / device
  const handleUploadPhotoFromGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Selecione uma imagem de até 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      setPhotos((prev) => [...prev, photoUrlInput.trim()]);
      setPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMovePhoto = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx > 0) {
      const next = [...photos];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      setPhotos(next);
    } else if (direction === 'down' && idx < photos.length - 1) {
      const next = [...photos];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      setPhotos(next);
    }
  };

  const handleAddOptionToField = () => {
    if (!newOptName.trim()) return;
    const item: CustomizationOptionItem = {
      id: `opt-${Date.now()}`,
      name: newOptName.trim(),
      priceModifier: newOptPrice || 0,
    };
    if (targetConfigField === 'format') setFormatOptions((p) => [...p, item]);
    if (targetConfigField === 'paper') setPaperOptions((p) => [...p, item]);
    if (targetConfigField === 'finish') setFinishOptions((p) => [...p, item]);
    if (targetConfigField === 'lamination') setLaminationOptions((p) => [...p, item]);
    if (targetConfigField === 'accessory') setAccessoryOptions((p) => [...p, item]);
    if (targetConfigField === 'specialCut') setSpecialCutOptions((p) => [...p, item]);
    if (targetConfigField === 'theme') setThemeOptions((p) => [...p, item]);
    if (targetConfigField === 'printType') setPrintTypeOptions((p) => [...p, item]);

    setNewOptName('');
    setNewOptPrice(0);
  };

  const handleAddPriceTier = () => {
    if (newTierMinQty <= 1 || newTierPrice <= 0) return;
    setPriceTiers((prev) => {
      const filtered = prev.filter((t) => t.minQty !== newTierMinQty);
      return [...filtered, { minQty: newTierMinQty, unitPrice: newTierPrice }].sort(
        (a, b) => a.minQty - b.minQty
      );
    });
    setNewTierPrice(0);
  };

  const handleRemovePriceTier = (minQty: number) => {
    setPriceTiers((prev) => prev.filter((t) => t.minQty !== minQty));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nome do produto é obrigatório');
      return;
    }

    const payload: Partial<Product> = {
      name: name.trim(),
      sku: sku.trim() || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: barcode.trim() || String(7891000000000 + Math.floor(Math.random() * 1000000)),
      categoryId,
      description: description.trim(),
      price: Number(price) || 0,
      promotionalPrice: promotionalPrice ? Number(promotionalPrice) : null,
      minQuantity: Number(minQuantity) || 1,
      estimatedDays: Number(estimatedDays) || 5,
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
      isNew,
      isFeatured,
      onSale,
      active,
      stock: isSobEncomenda ? null : stock,
      priceTiers: priceTiers.length > 0 ? priceTiers : undefined,
      customizationConfig: {
        format: { enabled: enableFormat, label: 'Formato / Tamanho', options: formatOptions },
        paperType: { enabled: enablePaper, label: 'Tipo e Gramatura do Papel', options: paperOptions },
        finish: { enabled: enableFinish, label: 'Acabamento / Wire-o', options: finishOptions },
        lamination: { enabled: enableLamination, label: 'Laminação da Capa', options: laminationOptions },
        specialCut: { enabled: enableSpecialCut, label: 'Corte Especial', options: specialCutOptions },
        theme: { enabled: enableTheme, label: 'Cores & Temas', options: themeOptions },
        printType: { enabled: enablePrintType, label: 'Tipo de Impressão', options: printTypeOptions },
        accessories: { enabled: enableAccessories, label: 'Acessórios & Embalagem', options: accessoryOptions },
        allowCustomText,
        customTextLabel: customTextLabel.trim() || 'Nome ou frase personalizada',
        allowImageUpload,
        allowNotes,
      },
    };

    if (editingProductId) {
      await adminUpdateProduct(editingProductId, payload);
    } else {
      await adminAddProduct(payload);
    }

    setIsModalOpen(false);
  };

  const handleDuplicate = async (prod: Product) => {
    const clone: Partial<Product> = {
      ...prod,
      id: undefined,
      name: `${prod.name} (Cópia)`,
      sku: `${prod.sku}-CP`,
      barcode: String(7891000000000 + Math.floor(Math.random() * 1000000)),
      createdAt: undefined,
      updatedAt: undefined,
    };
    await adminAddProduct(clone);
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${prodName}"?`)) {
      await adminDeleteProduct(id);
    }
  };

  const handleSaveInlineCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCatName.trim()) return;
    setIsSavingInlineCat(true);

    if (showInlineCatModal === 'new') {
      const newId = `cat-${Date.now()}`;
      await adminAddCategory({
        id: newId,
        name: inlineCatName.trim(),
        description: inlineCatDesc.trim(),
        active: inlineCatActive,
        order: categories.length + 1,
      });
      setCategoryId(newId);
    } else if (showInlineCatModal === 'edit') {
      const targetId = editingInlineCatId || categoryId;
      if (targetId) {
        await adminUpdateCategory(targetId, {
          name: inlineCatName.trim(),
          description: inlineCatDesc.trim(),
          active: inlineCatActive,
        });
      }
    }

    setIsSavingInlineCat(false);
    setShowInlineCatModal(null);
  };

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategoryFilter === 'todos' || p.categoryId === selectedCategoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.barcode?.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#C49A45]" />
            <span>Produtos & Galeria de Fotos</span>
          </h2>
          <p className="text-xs text-gray-500">
            Adicione fotos da sua galeria, configure códigos de barras e edite todas as opções de personalização que aparecem para o cliente.
          </p>
        </div>

        <button
          onClick={openNewProductModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5C4033] hover:bg-[#432d23] text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4 text-[#C49A45]" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, SKU ou código de barras..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-600">Categoria:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white text-[#5C4033]"
          >
            <option value="todos">Todas as Categorias ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((prod) => {
          const category = categories.find((c) => c.id === prod.categoryId);
          return (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-[#B08968]/20 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative aspect-4/3 bg-[#F5EBDD]/40">
                  <img src={prod.photos[0]} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!prod.active && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-white">
                        Inativo
                      </span>
                    )}
                    {prod.stock === null ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C49A45] text-white">
                        Sob Encomenda
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white">
                        Estoque: {prod.stock}
                      </span>
                    )}
                  </div>

                  {prod.barcode && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white font-mono text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Barcode className="w-3 h-3 text-[#C49A45]" />
                      <span>{prod.barcode}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3.5 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-[#B08968] uppercase">{category?.name}</span>
                  <h3 className="font-bold text-[#5C4033] line-clamp-1">{prod.name}</h3>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-sm font-bold text-[#C49A45]">
                      {formatCurrency(prod.promotionalPrice || prod.price)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Mín: {prod.minQuantity} un • ~{prod.estimatedDays}d
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-[#FFFDF9] border-t border-[#F5EBDD] flex items-center justify-between">
                <button
                  onClick={() => openEditProductModal(prod)}
                  className="inline-flex items-center gap-1 text-xs text-[#5C4033] hover:text-[#C49A45] font-semibold"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(prod)}
                    title="Duplicar Produto"
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id, prod.name)}
                    title="Excluir Produto"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-[#B08968]/30 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#5C4033]">
                  {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
                <span className="text-xs text-gray-500">
                  Preencha as informações, adicione fotos da sua galeria e configure as opções do cliente.
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-1">
                  1. Informações Básicas & Código de Barras
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Planner Anual Capa Dura Luxo"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="bg-[#F5EBDD]/40 p-2.5 rounded-xl border border-[#B08968]/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-[#5C4033]">Categoria *</label>
                      <button
                        type="button"
                        onClick={() => setShowInlineCatModal('manage')}
                        className="text-[10px] text-[#B08968] hover:text-[#5C4033] hover:underline font-bold"
                        title="Visualizar e gerenciar todas as categorias existentes"
                      >
                        📁 Gerenciar Todas
                      </button>
                    </div>

                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-[#C49A45]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {!c.active ? '(Oculta na vitrine)' : ''}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInlineCatId(null);
                          setInlineCatName('');
                          setInlineCatDesc('');
                          setInlineCatActive(true);
                          setShowInlineCatModal('new');
                        }}
                        className="px-2 py-1 bg-[#5C4033] text-white rounded-md font-bold hover:bg-[#432d23] text-[10px] flex items-center gap-1 shadow-2xs transition"
                      >
                        <Plus className="w-3 h-3 text-[#C49A45]" />
                        <span>Cadastrar Nova</span>
                      </button>

                      {categoryId && (
                        <button
                          type="button"
                          onClick={() => {
                            const curr = categories.find((c) => c.id === categoryId);
                            if (curr) {
                              setEditingInlineCatId(curr.id);
                              setInlineCatName(curr.name);
                              setInlineCatDesc(curr.description || '');
                              setInlineCatActive(curr.active);
                              setShowInlineCatModal('edit');
                            }
                          }}
                          className="px-2 py-1 bg-white border border-[#B08968]/40 text-[#5C4033] rounded-md font-bold hover:bg-[#F5EBDD] text-[10px] flex items-center gap-1 transition"
                        >
                          <Edit className="w-3 h-3 text-[#C49A45]" />
                          <span>Editar Esta</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Código de Barras (EAN)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Ex: 7891000100018"
                        className="w-full px-3 py-2 border rounded-xl font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setBarcode(String(7891000000000 + Math.floor(Math.random() * 1000000)))}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-semibold"
                        title="Gerar código aleatório"
                      >
                        Gerar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">SKU / Referência Interna</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Prazo de Produção (Dias úteis)</label>
                    <input
                      type="number"
                      min="1"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold mb-1">Descrição Detalhada do Produto</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva materiais, detalhes artesanais e diferenciais..."
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Photos Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-serif text-sm font-bold text-[#5C4033]">
                    2. Galeria de Fotos ({photos.length} fotos)
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadPhotoFromGallery}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C49A45] hover:bg-[#b58b38] text-white rounded-lg font-semibold text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Adicionar Foto da Minha Galeria</span>
                    </button>
                  </div>
                </div>

                {/* Add Photo by URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    placeholder="Ou cole a URL da imagem aqui (ex: https://...)"
                    className="flex-1 px-3 py-1.5 border rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold"
                  >
                    Adicionar URL
                  </button>
                </div>

                {/* Photos List Preview with Reorder and Delete */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 shadow-2xs"
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-[#5C4033] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Capa
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(idx, 'up')}
                            className="p-1 bg-white rounded text-gray-800"
                            title="Mover para frente"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        )}
                        {idx < photos.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(idx, 'down')}
                            className="p-1 bg-white rounded text-gray-800"
                            title="Mover para trás"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1 bg-red-600 rounded text-white"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Pricing & Availability */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-1">
                  3. Preço & Disponibilidade
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Preço Regular (R$) *</label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Preço Promocional (R$)</label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={promotionalPrice ?? ''}
                      onChange={(e) => setPromotionalPrice(e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Vazio se não houver"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Quantidade Mínima</label>
                    <input
                      type="number"
                      min="1"
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Disponibilidade</label>
                    <select
                      value={isSobEncomenda ? 'encomenda' : 'pronta_entrega'}
                      onChange={(e) => setIsSobEncomenda(e.target.value === 'encomenda')}
                      className="w-full px-3 py-2 border rounded-xl bg-white"
                    >
                      <option value="encomenda">Sob Encomenda</option>
                      <option value="pronta_entrega">Pronta Entrega (Estoque)</option>
                    </select>
                  </div>
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded text-[#5C4033]"
                    />
                    <span>Produto Ativo na Vitrine</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-[#5C4033]"
                    />
                    <span>Destaque na Página Inicial</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="rounded text-[#5C4033]"
                    />
                    <span>Selo "Novo"</span>
                  </label>
                </div>
              </div>

              {/* Section 4: Customer Customization Options Editor */}
              <div className="space-y-4">
                <div className="border-b pb-1">
                  <h4 className="font-serif text-sm font-bold text-[#5C4033]">
                    4. Opções de Personalização que Aparecem para o Cliente
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    O administrador tem controle total sobre quais opções de personalização o cliente poderá escolher.
                  </p>
                </div>

                {/* Formato / Tamanho */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableFormat}
                        onChange={(e) => setEnableFormat(e.target.checked)}
                        className="rounded"
                      />
                      <span>Habilitar Formatos / Tamanhos</span>
                    </label>
                  </div>
                  {enableFormat && (
                    <div className="space-y-1.5 pl-4">
                      {formatOptions.map((opt, i) => (
                        <div key={opt.id || i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                          <span>{opt.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {opt.priceModifier ? `+${formatCurrency(opt.priceModifier)}` : 'Sem adicional'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormatOptions((p) => p.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tipo e Gramatura do Papel */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePaper}
                      onChange={(e) => setEnablePaper(e.target.checked)}
                      className="rounded"
                    />
                    <span>Habilitar Tipo e Gramatura do Papel</span>
                  </label>
                  {enablePaper && (
                    <div className="space-y-1.5 pl-4">
                      {paperOptions.map((opt, i) => (
                        <div key={opt.id || i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                          <span>{opt.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {opt.priceModifier ? `+${formatCurrency(opt.priceModifier)}` : 'Sem adicional'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPaperOptions((p) => p.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acabamento / Wire-o */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableFinish}
                      onChange={(e) => setEnableFinish(e.target.checked)}
                      className="rounded"
                    />
                    <span>Habilitar Acabamento (Wire-o / Encadernação)</span>
                  </label>
                  {enableFinish && (
                    <div className="space-y-1.5 pl-4">
                      {finishOptions.map((opt, i) => (
                        <div key={opt.id || i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                          <span>{opt.name}</span>
                          <button
                            type="button"
                            onClick={() => setFinishOptions((p) => p.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Laminação */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableLamination}
                      onChange={(e) => setEnableLamination(e.target.checked)}
                      className="rounded"
                    />
                    <span>Habilitar Laminação da Capa</span>
                  </label>
                  {enableLamination && (
                    <div className="space-y-1.5 pl-4">
                      {laminationOptions.map((opt, i) => (
                        <div key={opt.id || i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                          <span>{opt.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {opt.priceModifier ? `+${formatCurrency(opt.priceModifier)}` : 'Sem adicional'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setLaminationOptions((p) => p.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acessórios & Embalagens */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAccessories}
                      onChange={(e) => setEnableAccessories(e.target.checked)}
                      className="rounded"
                    />
                    <span>Habilitar Adicionais (Fita, Laço, Caixa, Cantoneira)</span>
                  </label>
                  {enableAccessories && (
                    <div className="space-y-1.5 pl-4">
                      {accessoryOptions.map((opt, i) => (
                        <div key={opt.id || i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                          <span>{opt.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">+{formatCurrency(opt.priceModifier)}</span>
                            <button
                              type="button"
                              onClick={() => setAccessoryOptions((p) => p.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Corte Especial */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableSpecialCut}
                      onChange={(e) => setEnableSpecialCut(e.target.checked)}
                      className="rounded"
                    />
                    <span>Habilitar Corte Especial (Cantos Arredondados, Corte e Vinco)</span>
                  </label>
                  {enableSpecialCut && (
                    <div className="space-y-1.5 pl-4">
                      {specialCutOptions.map((opt, i) => (
                        <div key={opt.id || i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                          <span>{opt.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {opt.priceModifier ? `+${formatCurrency(opt.priceModifier)}` : 'Sem adicional'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSpecialCutOptions((p) => p.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cores & Temas */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTheme}
                      onChange={(e) => setEnableTheme(e.target.checked)}
                      className="rounded"
                    />
                    <span>Habilitar Escolha de Temas & Cores (Paletas, Estilos, Estampas)</span>
                  </label>
                  {enableTheme && (
                    <div className="space-y-1.5 pl-4">
                      {themeOptions.map((opt, i) => (
                        <div key={opt.id || i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                          <span>{opt.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {opt.priceModifier ? `+${formatCurrency(opt.priceModifier)}` : 'Sem adicional'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setThemeOptions((p) => p.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tipo de Impressão */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePrintType}
                      onChange={(e) => setEnablePrintType(e.target.checked)}
                      className="rounded"
                    />
                    <span>Habilitar Tipo de Impressão (Jato HD, Laser, Foil)</span>
                  </label>
                  {enablePrintType && (
                    <div className="space-y-1.5 pl-4">
                      {printTypeOptions.map((opt, i) => (
                        <div key={opt.id || i} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                          <span>{opt.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {opt.priceModifier ? `+${formatCurrency(opt.priceModifier)}` : 'Sem adicional'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPrintTypeOptions((p) => p.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Add Option Component */}
                <div className="p-3.5 bg-[#F5EBDD]/60 rounded-xl border border-[#B08968]/30 space-y-2">
                  <span className="font-bold text-[#5C4033] block">Adicionar Nova Opção para:</span>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={targetConfigField}
                      onChange={(e) => setTargetConfigField(e.target.value as any)}
                      className="px-2.5 py-1.5 border rounded-lg bg-white text-xs font-semibold"
                    >
                      <option value="format">Formato / Tamanho</option>
                      <option value="paper">Papel e Gramatura</option>
                      <option value="finish">Acabamento / Wire-o</option>
                      <option value="lamination">Laminação da Capa</option>
                      <option value="specialCut">Corte Especial</option>
                      <option value="theme">Cores & Temas</option>
                      <option value="printType">Tipo de Impressão</option>
                      <option value="accessory">Acessórios / Laço / Caixa</option>
                    </select>

                    <input
                      type="text"
                      value={newOptName}
                      onChange={(e) => setNewOptName(e.target.value)}
                      placeholder="Nome da opção (Ex: Dourado Metalizado)"
                      className="flex-1 min-w-44 px-3 py-1.5 border rounded-lg bg-white text-xs"
                    />

                    <input
                      type="number"
                      step="0.50"
                      value={newOptPrice}
                      onChange={(e) => setNewOptPrice(parseFloat(e.target.value) || 0)}
                      placeholder="+R$"
                      className="w-20 px-2 py-1.5 border rounded-lg bg-white text-xs font-mono"
                    />

                    <button
                      type="button"
                      onClick={handleAddOptionToField}
                      className="px-4 py-1.5 bg-[#5C4033] hover:bg-[#432d23] text-white rounded-lg font-bold text-xs shadow-xs"
                    >
                      + Incluir
                    </button>
                  </div>
                </div>

                {/* Faixas de Preço por Quantidade (Atacado) */}
                <div className="p-3.5 bg-white rounded-xl border border-[#B08968]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#5C4033] text-xs block">
                        Faixas de Preço por Quantidade / Atacado (Opcional)
                      </span>
                      <p className="text-[10px] text-gray-500">
                        Defina preços promocionais automáticos quando o cliente comprar em maiores quantidades.
                      </p>
                    </div>
                  </div>

                  {priceTiers.length > 0 && (
                    <div className="space-y-1">
                      {priceTiers.map((tier) => (
                        <div
                          key={tier.minQty}
                          className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded border"
                        >
                          <span>A partir de <strong>{tier.minQty} unidades</strong></span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#C49A45]">
                              {formatCurrency(tier.unitPrice)} / un
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePriceTier(tier.minQty)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="text-gray-500 text-[11px]">A partir de:</span>
                    <input
                      type="number"
                      min="2"
                      value={newTierMinQty}
                      onChange={(e) => setNewTierMinQty(parseInt(e.target.value) || 10)}
                      className="w-16 px-2 py-1 border rounded text-center"
                    />
                    <span className="text-gray-500 text-[11px]">unidades = R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={newTierPrice}
                      onChange={(e) => setNewTierPrice(parseFloat(e.target.value) || 0)}
                      placeholder="Valor unit."
                      className="w-24 px-2 py-1 border rounded text-right font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddPriceTier}
                      className="px-3 py-1 bg-[#5C4033] text-white rounded font-bold hover:bg-[#432d23]"
                    >
                      + Adicionar Faixa
                    </button>
                  </div>
                </div>

                {/* Text customization, Image upload & Notes toggles */}
                <div className="bg-gray-50 p-3.5 rounded-xl border space-y-2.5">
                  <span className="font-bold text-[#5C4033] block text-xs">
                    Campos Livres para o Cliente:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={allowCustomText}
                        onChange={(e) => setAllowCustomText(e.target.checked)}
                        className="rounded"
                      />
                      <span>Gravação de Nome/Frase</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={allowImageUpload}
                        onChange={(e) => setAllowImageUpload(e.target.checked)}
                        className="rounded"
                      />
                      <span>Upload de Imagem/Logo</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={allowNotes}
                        onChange={(e) => setAllowNotes(e.target.checked)}
                        className="rounded"
                      />
                      <span>Campo de Observações</span>
                    </label>
                  </div>

                  {allowCustomText && (
                    <div className="pt-1.5">
                      <label className="block text-[11px] text-gray-600 mb-0.5">
                        Rótulo do campo de gravação (o que o cliente lê):
                      </label>
                      <input
                        type="text"
                        value={customTextLabel}
                        onChange={(e) => setCustomTextLabel(e.target.value)}
                        placeholder="Ex: Nome da pessoa ou frase para a capa"
                        className="w-full px-3 py-1.5 border rounded-lg bg-white text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingProductId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Inline Category Creation / Edit / Manage Modal */}
      {showInlineCatModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          {showInlineCatModal === 'manage' ? (
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-[#B08968]/30 text-xs max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#F5EBDD] text-[#5C4033]">
                    <Layers className="w-4 h-4 text-[#C49A45]" />
                  </span>
                  <h4 className="font-serif text-sm font-bold text-[#5C4033]">
                    Gerenciar Todas as Categorias
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInlineCatModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500 text-[11px]">
                  {categories.length} categorias cadastradas
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingInlineCatId(null);
                    setInlineCatName('');
                    setInlineCatDesc('');
                    setInlineCatActive(true);
                    setShowInlineCatModal('new');
                  }}
                  className="px-3 py-1.5 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C49A45]" />
                  <span>Cadastrar Nova</span>
                </button>
              </div>

              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto border rounded-xl">
                {categories.map((cat) => {
                  const prodCount = products.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#5C4033] text-xs">{cat.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {cat.active ? 'Ativa' : 'Oculta'}
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-[10px] text-gray-500 line-clamp-1">{cat.description}</p>
                        )}
                        <span className="text-[10px] text-[#B08968]">
                          {prodCount} produto(s) vinculado(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingInlineCatId(cat.id);
                            setInlineCatName(cat.name);
                            setInlineCatDesc(cat.description || '');
                            setInlineCatActive(cat.active);
                            setShowInlineCatModal('edit');
                          }}
                          className="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                          title="Editar Categoria"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Confirmar exclusão definitiva da categoria "${cat.name}"?`)) {
                              await adminDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Excluir Categoria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowInlineCatModal(null)}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
                >
                  Concluir & Fechar
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-3 shadow-2xl border border-[#B08968]/30 text-xs">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="font-serif text-sm font-bold text-[#5C4033]">
                  {showInlineCatModal === 'new' ? 'Cadastrar Nova Categoria' : 'Editar Categoria Existente'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowInlineCatModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveInlineCategory} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Nome da Categoria *</label>
                  <input
                    type="text"
                    required
                    value={inlineCatName}
                    onChange={(e) => setInlineCatName(e.target.value)}
                    placeholder="Ex: Festas & Eventos"
                    className="w-full px-3 py-1.5 border rounded-xl focus:ring-1 focus:ring-[#C49A45]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={inlineCatDesc}
                    onChange={(e) => setInlineCatDesc(e.target.value)}
                    placeholder="Descrição amigável para a vitrine..."
                    className="w-full px-3 py-1.5 border rounded-xl focus:ring-1 focus:ring-[#C49A45]"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={inlineCatActive}
                      onChange={(e) => setInlineCatActive(e.target.checked)}
                      className="rounded text-[#5C4033] focus:ring-[#C49A45]"
                    />
                    <span>Ativa e visível na vitrine do cliente</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowInlineCatModal(null)}
                    className="px-3 py-1.5 border rounded-xl hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingInlineCat}
                    className="px-4 py-1.5 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {isSavingInlineCat ? 'Salvando...' : 'Salvar Categoria'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
