import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    // Return sanitized data (never expose admin password hashes or sensitive internal tokens)
    return NextResponse.json({
      settings: db.settings,
      categories: db.categories,
      products: db.products,
      orders: db.orders,
      clients: db.clients,
      coupons: db.coupons,
      auditLogs: db.auditLogs.slice(0, 30),
      adminStatus: {
        isTemporaryPassword: db.adminAuth.isTemporaryPassword,
        username: db.adminAuth.username,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados do sistema' }, { status: 500 });
  }
}
