'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { ClientData } from '@/lib/types';
import {
  formatCurrency,
  formatPhone,
  maskCPF,
  createWhatsAppLink,
} from '@/lib/formatters';
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Download,
  MessageCircle,
  ShoppingBag,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';

export function ClientsManagerView() {
  const { clients, orders, adminAddClient, adminUpdateClient, adminDeleteClient } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Luís');
  const [state, setState] = useState('MA');
  const [zipCode, setZipCode] = useState('');
  const [consentWhatsapp, setConsentWhatsapp] = useState(true);

  const openNewModal = () => {
    setEditingClient(null);
    setName('');
    setCpf('');
    setBirthDate('');
    setWhatsapp('');
    setEmail('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('São Luís');
    setState('MA');
    setZipCode('');
    setConsentWhatsapp(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClientData) => {
    setEditingClient(c);
    setName(c.name);
    setCpf(c.cpf || '');
    setBirthDate(c.birthDate || '');
    setWhatsapp(c.whatsapp);
    setEmail(c.email || '');
    setStreet(c.address?.street || '');
    setNumber(c.address?.number || '');
    setNeighborhood(c.address?.neighborhood || '');
    setCity(c.address?.city || 'São Luís');
    setState(c.address?.state || 'MA');
    setZipCode(c.address?.zipCode || '');
    setConsentWhatsapp(!!c.consentWhatsapp);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Partial<ClientData> = {
      name: name.trim(),
      cpf: cpf.replace(/\D/g, '') || undefined,
      birthDate: birthDate.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
      email: email.trim(),
      address: street.trim()
        ? {
            street: street.trim(),
            number: number.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
          }
        : undefined,
      consentWhatsapp,
      consentTerms: true,
    };

    if (editingClient) {
      await adminUpdateClient(editingClient.id!, payload);
    } else {
      await adminAddClient(payload);
    }

    setIsModalOpen(false);
  };

  const handleAnonymize = async (c: ClientData) => {
    if (
      confirm(
        `Direito ao Esquecimento (LGPD): Deseja anonimizar os dados de "${c.name}"? Os registros fiscais de vendas anteriores serão preservados, mas os dados de identificação pessoal serão destruídos.`
      )
    ) {
      await adminUpdateClient(c.id!, {}, 'anonymize');
    }
  };

  const handleDelete = async (id: string, clientName: string) => {
    if (confirm(`Tem certeza que deseja excluir o cadastro de "${clientName}"?`)) {
      await adminDeleteClient(id);
    }
  };

  // Export Clients to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'WhatsApp', 'CPF_Mascarado', 'Data_Nascimento', 'Email', 'Consentimento_WhatsApp'];
    const rows = clients.map((c) => [
      `"${c.id || ''}"`,
      `"${c.name}"`,
      `"${c.whatsapp}"`,
      `"${maskCPF(c.cpf)}"`,
      `"${c.birthDate}"`,
      `"${c.email || ''}"`,
      `"${c.consentWhatsapp ? 'SIM' : 'NAO'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clientes_recriar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.whatsapp.includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.cpf && c.cpf.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C49A45]" />
            <span>Cadastro de Clientes & LGPD</span>
          </h2>
          <p className="text-xs text-gray-500">
            Gerencie contatos, histórico de pedidos, datas de aniversário e conformidade com a LGPD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F5EBDD] hover:bg-[#ebdcc9] text-[#5C4033] text-xs font-semibold rounded-xl border border-[#B08968]/30 transition"
          >
            <Download className="w-4 h-4 text-[#C49A45]" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C4033] hover:bg-[#432d23] text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <UserPlus className="w-4 h-4 text-[#C49A45]" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, WhatsApp ou CPF..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45]"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-[#B08968]/20 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EBDD]/60 text-[#5C4033] font-bold border-b border-[#B08968]/20">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">WhatsApp / E-mail</th>
                <th className="py-3 px-4">CPF Mascarado</th>
                <th className="py-3 px-4">Data Nasc.</th>
                <th className="py-3 px-4">Total Gasto & Pedidos</th>
                <th className="py-3 px-4">Consentimento WhatsApp</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((cli) => {
                const clientOrders = orders.filter(
                  (o) =>
                    (o.client.whatsapp && o.client.whatsapp.replace(/\D/g, '') === cli.whatsapp.replace(/\D/g, '')) ||
                    (o.client.cpf && cli.cpf && o.client.cpf.replace(/\D/g, '') === cli.cpf.replace(/\D/g, ''))
                );
                const totalSpent = clientOrders.reduce((acc, o) => acc + o.total, 0);

                return (
                  <tr key={cli.id} className="hover:bg-[#FFFDF9] transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#5C4033] text-sm block">{cli.name}</span>
                      {cli.address && (
                        <span className="text-[10px] text-gray-400 block truncate max-w-xs">
                          {cli.address.city}/{cli.address.state}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {cli.whatsapp ? (
                        <a
                          href={createWhatsAppLink(cli.whatsapp, `Olá, ${cli.name.split(' ')[0]}!`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{formatPhone(cli.whatsapp)}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      <span className="text-[11px] text-gray-500 block">{cli.email || 'Sem e-mail'}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {cli.cpf ? maskCPF(cli.cpf) : <span className="text-gray-400">Não informado</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800">{cli.birthDate || '-'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#C49A45]">{formatCurrency(totalSpent)}</span>
                      <span className="text-[10px] text-gray-400 block">{clientOrders.length} pedido(s)</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {cli.consentWhatsapp ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          <span>Autorizado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                          <XCircle className="w-3 h-3" />
                          <span>Não autorizado</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cli)}
                          title="Editar Cliente"
                          className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleAnonymize(cli)}
                          title="Anonimizar Dados (LGPD)"
                          className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(cli.id!, cli.name)}
                          title="Excluir Cadastro"
                          className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-[#B08968]/30 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-serif text-lg font-bold text-[#5C4033]">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(99) 98181-4313"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">CPF (Opcional)</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Data de Nascimento (DD/MM/AAAA)</label>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="15/10/1990"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={consentWhatsapp}
                    onChange={(e) => setConsentWhatsapp(e.target.checked)}
                    className="rounded text-[#5C4033]"
                  />
                  <span>Autoriza mensagens de aniversário pelo WhatsApp (LGPD)</span>
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
                  Salvar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
