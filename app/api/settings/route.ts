import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logAudit, saveDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ settings: db.settings });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDatabase();

    db.settings = {
      ...db.settings,
      ...body,
      // preserve sub-objects if partially provided
      colors: {
        ...db.settings.colors,
        ...(body.colors || {}),
      },
      fiscalSettings: {
        ...db.settings.fiscalSettings,
        ...(body.fiscalSettings || {}),
      },
      banners: Array.isArray(body.banners) ? body.banners : db.settings.banners,
    };

    saveDatabase(db);
    logAudit('CONFIGURACOES_ATUALIZADAS', 'Loja', 'Configurações de identidade visual, banners, logo ou fiscais atualizadas.');

    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 });
  }
}
