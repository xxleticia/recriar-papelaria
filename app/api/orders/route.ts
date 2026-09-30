import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logAudit, saveDatabase } from '@/lib/db';
import { Order, OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    return NextResponse.json({ orders: db.orders });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar pedidos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const currentYear = new Date().getFullYear();
    const count = db.orders.length + 1;
    const generatedId = `REC-${currentYear}-${String(count).padStart(3, '0')}`;

    const newOrder: Order = {
      id: body.id || generatedId,
      date: new Date().toISOString(),
      status: body.status || 'Novo',
      isOpenSale: !!body.isOpenSale,
      client: body.client,
      items: body.items || [],
      shippingMethod: body.shippingMethod || 'retirada',
      shippingFee: Number(body.shippingFee) || 0,
      paymentMethod: body.paymentMethod || 'Pendente',
      paymentStatus: body.paymentStatus || 'Pendente',
      couponCode: body.couponCode || undefined,
      discountValue: Number(body.discountValue) || 0,
      subtotal: Number(body.subtotal) || 0,
      total: Number(body.total) || 0,
      trackingCode: body.trackingCode || '',
      internalNotes: body.internalNotes || '',
      statusHistory: [
        {
          status: body.status || 'Novo',
          timestamp: new Date().toISOString(),
          note: body.origin === 'pdv_admin' ? 'Venda registrada via PDV Balcão' : 'Pedido realizado pelo cliente na vitrine',
        },
      ],
      origin: body.origin || 'vitrine',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto sync client into db.clients
    if (newOrder.client && (newOrder.client.name || newOrder.client.whatsapp)) {
      const existingClientIdx = db.clients.findIndex(
        (c) =>
          (c.whatsapp && newOrder.client.whatsapp && c.whatsapp.replace(/\D/g, '') === newOrder.client.whatsapp.replace(/\D/g, '')) ||
          (c.cpf && newOrder.client.cpf && c.cpf.replace(/\D/g, '') === newOrder.client.cpf.replace(/\D/g, '')) ||
          (c.email && newOrder.client.email && c.email.toLowerCase() === newOrder.client.email.toLowerCase())
      );

      if (existingClientIdx >= 0) {
        db.clients[existingClientIdx] = {
          ...db.clients[existingClientIdx],
          name: newOrder.client.name || db.clients[existingClientIdx].name,
          email: newOrder.client.email || db.clients[existingClientIdx].email,
          birthDate: newOrder.client.birthDate || db.clients[existingClientIdx].birthDate,
          address: newOrder.client.address || db.clients[existingClientIdx].address,
          consentWhatsapp: newOrder.client.consentWhatsapp ?? db.clients[existingClientIdx].consentWhatsapp,
          consentTerms: newOrder.client.consentTerms ?? db.clients[existingClientIdx].consentTerms,
        };
      } else {
        db.clients.push({
          id: `cli-${Date.now()}`,
          name: newOrder.client.name,
          cpf: newOrder.client.cpf,
          birthDate: newOrder.client.birthDate || '',
          email: newOrder.client.email || '',
          whatsapp: newOrder.client.whatsapp || '',
          address: newOrder.client.address,
          consentTerms: !!newOrder.client.consentTerms,
          consentWhatsapp: !!newOrder.client.consentWhatsapp,
        });
      }
    }

    // Insert order at front
    db.orders.unshift(newOrder);
    saveDatabase(db);

    logAudit(
      'NOVO_PEDIDO',
      'Pedidos',
      `Pedido ${newOrder.id} criado por ${newOrder.client.name} - Total: R$ ${newOrder.total.toFixed(2)} (${newOrder.origin})`,
      newOrder.id
    );

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar pedido:', error);
    return NextResponse.json({ error: 'Erro ao processar e salvar pedido' }, { status: 500 });
  }
}

// Edit existing order (all sales editable)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID do pedido obrigatório' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const currentOrder = db.orders[index];
    const oldStatus = currentOrder.status;

    // Check status change
    let statusHistory = [...currentOrder.statusHistory];
    if (updates.status && updates.status !== oldStatus) {
      statusHistory.push({
        status: updates.status as OrderStatus,
        timestamp: new Date().toISOString(),
        note: updates.statusChangeNote || `Status alterado de "${oldStatus}" para "${updates.status}" pelo administrador`,
      });
    }

    // Merge updates
    const updatedOrder: Order = {
      ...currentOrder,
      ...updates,
      statusHistory,
      updatedAt: new Date().toISOString(),
    };

    db.orders[index] = updatedOrder;
    saveDatabase(db);

    logAudit(
      'PEDIDO_EDITADO',
      'Pedidos',
      `Pedido ${id} atualizado. Status: ${updatedOrder.status}. Total: R$ ${updatedOrder.total.toFixed(2)}`,
      id
    );

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const removed = db.orders.splice(index, 1)[0];
    saveDatabase(db);

    logAudit('PEDIDO_EXCLUIDO', 'Pedidos', `Pedido ${id} de ${removed.client.name} excluído.`, id);

    return NextResponse.json({ success: true, message: `Pedido ${id} removido com sucesso.` });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir pedido' }, { status: 500 });
  }
}
