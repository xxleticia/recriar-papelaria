'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { formatPhone, createWhatsAppLink } from '@/lib/formatters';
import {
  Cake,
  MessageCircle,
  Gift,
  Send,
  CheckCircle,
  AlertCircle,
  Copy,
  Clock,
  Sparkles,
} from 'lucide-react';

export function BirthdayMessagesView() {
  const { clients, settings, adminAddCoupon, coupons } = useStore();

  const [messageTemplate, setMessageTemplate] = useState(
    settings.birthdayMessageTemplate ||
      'Olá, {primeiro_nome}! Hoje é um dia especial. Nós da Papelaria Recriar desejamos um feliz aniversário com muita saúde e realizações! Preparamos um presente especial para você: o cupom {codigo_cupom}, com 15% de desconto válido até {data_validade}, para você comemorar conosco.'
  );

  const [sentRecords, setSentRecords] = useState<string[]>([]);
  const [createdCoupons, setCreatedCoupons] = useState<{ [clientId: string]: string }>({});

  // Check today's day and month (e.g. 29/09)
  const today = new Date();
  const currentDay = String(today.getDate()).padStart(2, '0');
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDDMM = `${currentDay}/${currentMonth}`;

  // Filter clients who have birthday today and this month
  const birthdayClients = clients.map((c) => {
    let isToday = false;
    let isThisMonth = false;
    let day = '';
    let month = '';

    if (c.birthDate && c.birthDate.includes('/')) {
      const parts = c.birthDate.split('/');
      day = parts[0];
      month = parts[1];
      if (day === currentDay && month === currentMonth) {
        isToday = true;
      }
      if (month === currentMonth) {
        isThisMonth = true;
      }
    }

    return {
      client: c,
      isToday,
      isThisMonth,
      day,
      month,
      hasConsent: !!c.consentWhatsapp,
    };
  });

  const todaysBirthdays = birthdayClients.filter((b) => b.isToday);
  const monthBirthdays = birthdayClients.filter((b) => b.isThisMonth);

  // Generate birthday coupon
  const handleGenerateCouponForClient = async (clientId: string, clientName: string) => {
    const firstName = clientName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const code = `NIVER-${firstName}-${Date.now().toString().slice(-4)}`;
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await adminAddCoupon({
      code,
      description: `Cupom exclusivo de aniversário para ${clientName}`,
      discountType: 'percent',
      discountValue: settings.birthdayCouponDiscountPercent || 15,
      minOrderValue: 40.0,
      maxUses: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: validUntil,
      active: true,
      isBirthdayCoupon: true,
    });

    setCreatedCoupons((prev) => ({ ...prev, [clientId]: code }));
    return code;
  };

  const handleSendWhatsApp = async (b: (typeof birthdayClients)[0]) => {
    const cli = b.client;
    const firstName = cli.name.split(' ')[0];

    let couponCode = createdCoupons[cli.id!] || 'NIVERESPECIAL';
    if (!createdCoupons[cli.id!]) {
      couponCode = await handleGenerateCouponForClient(cli.id!, cli.name);
    }

    const validityDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

    // Replace tags
    const finalMsg = messageTemplate
      .replace('{primeiro_nome}', firstName)
      .replace('{codigo_cupom}', couponCode)
      .replace('{data_validade}', validityDate);

    const waLink = createWhatsAppLink(cli.whatsapp, finalMsg);
    window.open(waLink, '_blank');

    setSentRecords((prev) => [...prev, cli.id!]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#5C4033] flex items-center gap-2">
            <Cake className="w-6 h-6 text-[#C49A45]" />
            <span>Mensagens Automáticas de Aniversário (WhatsApp)</span>
          </h2>
          <p className="text-xs text-gray-500">
            Fidelize seus clientes com mensagens carinhosas e cupons automáticos no dia do aniversário, com total conformidade LGPD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full">
            {todaysBirthdays.length} aniversariante(s) hoje ({todayDDMM})
          </span>
        </div>
      </div>

      {/* Grid: Left (List of Birthday Customers) vs Right (Template Editor & Config) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {/* Today's Celebrations */}
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C49A45]" />
                <span>Aniversariantes de Hoje ({todayDDMM})</span>
              </span>
              <span className="text-xs font-normal text-emerald-700 font-medium">
                {todaysBirthdays.length} cliente(s)
              </span>
            </h3>

            {todaysBirthdays.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Nenhum cliente cadastrado faz aniversário na data de hoje.
              </div>
            ) : (
              <div className="space-y-3">
                {todaysBirthdays.map((b) => {
                  const alreadySent = sentRecords.includes(b.client.id!);
                  return (
                    <div
                      key={b.client.id}
                      className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5EBDD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#5C4033] text-sm">{b.client.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            🎉 Aniversariante Hoje!
                          </span>
                        </div>
                        <div className="text-gray-500">
                          WhatsApp: <strong>{formatPhone(b.client.whatsapp)}</strong> • Nasc: {b.client.birthDate}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {b.hasConsent ? (
                            <span className="text-emerald-700 font-medium">✓ Consentimento LGPD ativo</span>
                          ) : (
                            <span className="text-red-600 font-medium">✕ Sem consentimento WhatsApp</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={!b.hasConsent}
                          onClick={() => handleSendWhatsApp(b)}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition ${
                            alreadySent
                              ? 'bg-gray-100 text-gray-700 border'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{alreadySent ? 'Enviado Novamente' : 'Enviar Mensagem'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* This Month's Celebrations */}
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center justify-between">
              <span>Próximos Aniversariantes do Mês ({currentMonth})</span>
              <span className="text-xs text-gray-500">{monthBirthdays.length} no total</span>
            </h3>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {monthBirthdays.map((b) => (
                <div key={b.client.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-800">{b.client.name}</span>
                    <span className="text-gray-400 block text-[11px]">{formatPhone(b.client.whatsapp)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#C49A45]">{b.client.birthDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 5 cols (Message Template Editor) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#B08968]/20 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#5C4033] border-b pb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#C49A45]" />
              <span>Modelo da Mensagem de Aniversário</span>
            </h3>

            <p className="text-[11px] text-gray-500">
              Você pode editar o texto que será enviado automaticamente. Use as variáveis abaixo:
            </p>

            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <code className="bg-[#F5EBDD] text-[#5C4033] px-2 py-0.5 rounded font-mono font-bold">
                {'{primeiro_nome}'}
              </code>
              <code className="bg-[#F5EBDD] text-[#5C4033] px-2 py-0.5 rounded font-mono font-bold">
                {'{codigo_cupom}'}
              </code>
              <code className="bg-[#F5EBDD] text-[#5C4033] px-2 py-0.5 rounded font-mono font-bold">
                {'{data_validade}'}
              </code>
            </div>

            <textarea
              rows={6}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full p-3 border rounded-xl font-sans text-xs focus:ring-2 focus:ring-[#C49A45]"
            />

            {/* Live Message Preview */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <span className="font-bold block text-emerald-800">Prévia no WhatsApp:</span>
              <p className="italic">
                {messageTemplate
                  .replace('{primeiro_nome}', 'Mariana')
                  .replace('{codigo_cupom}', 'NIVER-MARIANA-2026')
                  .replace('{data_validade}', '30/10/2026')}
              </p>
            </div>

            {/* LGPD Requirements Note */}
            <div className="p-3 bg-gray-50 rounded-xl text-[10px] text-gray-500 space-y-1">
              <span className="font-bold text-gray-700 block">Exigências Legais LGPD:</span>
              <p>• O envio ocorre exclusivamente para clientes que autorizaram mensagens no checkout.</p>
              <p>• A data de nascimento completa nunca é revelada na mensagem pública.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
