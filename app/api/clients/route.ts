import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logAudit, saveDatabase } from '@/lib/db';
import { ClientData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ clients: db.clients });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar clientes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newClient: ClientData = {
      id: body.id || `cli-${Date.now()}`,
      name: body.name || 'Cliente Sem Nome',
      cpf: body.cpf || '',
      birthDate: body.birthDate || '',
      email: body.email || '',
      whatsapp: body.whatsapp || '',
      address: body.address || undefined,
      consentTerms: body.consentTerms !== undefined ? !!body.consentTerms : true,
      consentWhatsapp: body.consentWhatsapp !== undefined ? !!body.consentWhatsapp : true,
    };

    db.clients.unshift(newClient);
    saveDatabase(db);

    logAudit('CLIENTE_CADASTRADO', 'Clientes', `Cliente ${newClient.name} cadastrado pelo administrador.`, newClient.id);

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar cliente' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates, action } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID do cliente obrigatório' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    if (action === 'anonymize') {
      // LGPD Right to Anonymization
      db.clients[index] = {
        ...db.clients[index],
        name: `Cliente Anonimizado #${id.slice(-4)}`,
        cpf: '00000000000',
        email: 'anonimizado@lgpd.recriar.local',
        whatsapp: '00000000000',
        address: undefined,
        consentTerms: false,
        consentWhatsapp: false,
      };
      saveDatabase(db);
      logAudit('LGPD_ANONIMIZACAO', 'Clientes', `Dados do cliente ${id} foram anonimizados conforme LGPD.`, id);
      return NextResponse.json({ success: true, message: 'Dados anonimizados com sucesso.' });
    }

    db.clients[index] = {
      ...db.clients[index],
      ...updates,
    };
    saveDatabase(db);

    logAudit('CLIENTE_EDITADO', 'Clientes', `Cliente ${db.clients[index].name} atualizado.`, id);

    return NextResponse.json({ success: true, client: db.clients[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
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
    const index = db.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const removed = db.clients.splice(index, 1)[0];
    saveDatabase(db);

    logAudit('CLIENTE_EXCLUIDO', 'Clientes', `Cliente ${removed.name} excluído do cadastro.`, id);

    return NextResponse.json({ success: true, message: `Cliente ${removed.name} excluído com sucesso.` });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 });
  }
}
