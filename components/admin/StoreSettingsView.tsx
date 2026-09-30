'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/lib/store-context';
import { StoreBanner, StoreColors } from '@/lib/types';
import {
  Palette,
  Image as ImageIcon,
  Save,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  Phone,
  Store,
  Sparkles,
  Layout,
} from 'lucide-react';

export function StoreSettingsView() {
  const { settings, adminUpdateSettings } = useStore();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [email, setEmail] = useState(settings.email);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [address, setAddress] = useState(settings.address);
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [productionNotice, setProductionNotice] = useState(settings.productionNotice);

  // Logo state
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);

  // Banners state
  const [banners, setBanners] = useState<StoreBanner[]>(settings.banners || []);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  // Colors state
  const [colors, setColors] = useState<StoreColors>(
    settings.colors || {
      primary: '#5C4033',
      secondary: '#B08968',
      accent: '#C49A45',
      beige: '#F5EBDD',
      cream: '#FFFDF9',
    }
  );

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Handle Logo Upload from device
  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Banner Upload from device
  const handleUploadBannerImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBanner = () => {
    if (!bannerImageUrl.trim()) {
      alert('Selecione uma foto da galeria ou insira a URL da imagem para o banner.');
      return;
    }

    const newBanner: StoreBanner = {
      id: `banner-${Date.now()}`,
      title: bannerTitle.trim() || 'Destaques Especiais',
      subtitle: bannerSubtitle.trim() || 'Papelaria Personalizada Feita à Mão com Afeto',
      badge: bannerBadge.trim() || 'Novidade',
      imageUrl: bannerImageUrl.trim(),
      active: true,
    };

    setBanners((prev) => [...prev, newBanner]);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerBadge('');
    setBannerImageUrl('');
  };

  const handleRemoveBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleBannerActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const success = await adminUpdateSettings({
      name: name.trim(),
      tagline: tagline.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
      email: email.trim(),
      instagram: instagram.trim(),
      address: address.trim(),
      announcementText: announcementText.trim(),
      productionNotice: productionNotice.trim(),
      logoUrl,
      banners,
      colors,
    });

    setIsSaving(false);
    if (success) {
      setFeedbackMsg('Configurações da loja e identidade visual salvas com sucesso!');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      alert('Erro ao salvar configurações.');
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#C49A45]" />
            <span>Configurações da Loja & Identidade Visual</span>
          </h2>
          <p className="text-xs text-gray-500">
            Altere a foto da logo, banners da página principal, paleta de cores, número do WhatsApp e dados da empresa.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5C4033] hover:bg-[#432d23] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#C49A45]" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Logo & General Store Info */}
        <div className="space-y-5">
          {/* Logo Editor */}
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#C49A45]" />
              <span>Foto do Logotipo (Editável)</span>
            </h3>

            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#F5EBDD] border-2 border-[#C49A45] shadow-xs shrink-0 flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo da loja" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-serif font-bold text-2xl text-[#5C4033]">R</span>
                )}
              </div>

              <div className="space-y-2 flex-1 text-xs">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleUploadLogo}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F5EBDD] hover:bg-[#ebdcc9] text-[#5C4033] font-semibold rounded-xl border border-[#B08968]/30 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C49A45]" />
                  <span>Escolher Foto da Galeria</span>
                </button>

                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Ou cole a URL direta da imagem da logo..."
                  className="w-full px-3 py-1.5 border rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Store Info & WhatsApp */}
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#C49A45]" />
              <span>Dados da Empresa & Atendimento</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Número do WhatsApp (Sem símbolos)</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="99981814313"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[#5C4033]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Endereço do Ateliê / Retirada</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Faixa de Aviso do Topo (Barra Superior)</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Color Palette Customizer */}
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#C49A45]" />
              <span>Paleta de Cores da Loja (Personalizável)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Marrom-Escuro (Primária)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.primary}
                    onChange={(e) => setColors((c) => ({ ...c, primary: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer border"
                  />
                  <span className="font-mono text-[11px]">{colors.primary}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Marrom-Claro (Secundária)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.secondary}
                    onChange={(e) => setColors((c) => ({ ...c, secondary: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer border"
                  />
                  <span className="font-mono text-[11px]">{colors.secondary}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Dourado (Destaque)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.accent}
                    onChange={(e) => setColors((c) => ({ ...c, accent: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer border"
                  />
                  <span className="font-mono text-[11px]">{colors.accent}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bege (Cards & Fundo)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.beige}
                    onChange={(e) => setColors((c) => ({ ...c, beige: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer border"
                  />
                  <span className="font-mono text-[11px]">{colors.beige}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Branco Suave (Apoio)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.cream}
                    onChange={(e) => setColors((c) => ({ ...c, cream: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer border"
                  />
                  <span className="font-mono text-[11px]">{colors.cream}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Banners of Main Page (Edit, Add, Remove) */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-4 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#C49A45]" />
                <span>Banners da Página Principal ({banners.length})</span>
              </span>
              <span className="text-[11px] text-gray-400 font-normal">Editáveis</span>
            </h3>

            {/* Existing Banners List */}
            <div className="space-y-3">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD] flex gap-3 items-center justify-between"
                >
                  <img
                    src={b.imageUrl}
                    alt=""
                    className="w-24 h-16 object-cover rounded-xl border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#5C4033] truncate">{b.title}</span>
                      {b.badge && (
                        <span className="px-1.5 py-0.2 bg-[#C49A45] text-white text-[9px] rounded-full">
                          {b.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{b.subtitle}</p>
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(b.id)}
                      className={`text-[10px] font-semibold mt-1 ${
                        b.active ? 'text-emerald-700' : 'text-gray-400'
                      }`}
                    >
                      {b.active ? '● Ativo na vitrine' : '○ Pausado'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBanner(b.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Banner Form */}
            <div className="p-4 bg-[#F5EBDD]/60 rounded-2xl border border-[#B08968]/30 space-y-3">
              <span className="font-bold text-[#5C4033] block">Adicionar Novo Banner Principal</span>

              <div className="space-y-2">
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Título do Banner (Ex: Planners 2026/2027)"
                  className="w-full px-3 py-1.5 border rounded-xl bg-white"
                />

                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Subtítulo descritivo..."
                  className="w-full px-3 py-1.5 border rounded-xl bg-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    placeholder="Selo (Ex: Lançamento)"
                    className="w-full px-3 py-1.5 border rounded-xl bg-white"
                  />

                  <div className="flex gap-1">
                    <input
                      type="file"
                      ref={bannerInputRef}
                      onChange={handleUploadBannerImage}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="w-full px-2 py-1.5 bg-[#5C4033] text-white rounded-xl font-semibold flex items-center justify-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Galeria</span>
                    </button>
                  </div>
                </div>

                <input
                  type="url"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  placeholder="Ou URL da foto do banner..."
                  className="w-full px-3 py-1.5 border rounded-xl bg-white"
                />

                <button
                  type="button"
                  onClick={handleAddBanner}
                  className="w-full py-2 bg-[#C49A45] hover:bg-[#b58b38] text-white font-bold rounded-xl transition shadow-xs"
                >
                  + Incluir Banner no Carrossel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
