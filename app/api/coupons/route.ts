import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logAudit, saveDatabase } from '@/lib/db';
import { Coupon } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const orderTotal = Number(searchParams.get('total') || 0);

    const db = getDatabase();

    // If validating a specific coupon
    if (code) {
      const cleanCode = code.trim().toUpperCase();
      const coupon = db.coupons.find((c) => c.code.toUpperCase() === cleanCode);

      if (!coupon) {
        return NextResponse.json({ valid: false, error: 'Cupom não encontrado ou inválido.' }, { status: 404 });
      }

      if (!coupon.active) {
        return NextResponse.json({ valid: false, error: 'Este cupom está desativado.' }, { status: 400 });
      }

      const today = new Date().toISOString().split('T')[0];
      if (coupon.validFrom && today < coupon.validFrom) {
        return NextResponse.json({ valid: false, error: 'Este cupom ainda não é válido.' }, { status: 400 });
      }
      if (coupon.validTo && today > coupon.validTo) {
        return NextResponse.json({ valid: false, error: 'Este cupom já expirou.' }, { status: 400 });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ valid: false, error: 'Este cupom atingiu o limite máximo de utilizações.' }, { status: 400 });
      }

      if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
        return NextResponse.json(
          {
            valid: false,
            error: `O valor mínimo do pedido para este cupom é de R$ ${coupon.minOrderValue.toFixed(2)}.`,
          },
          { status: 400 }
        );
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percent') {
        discountAmount = (orderTotal * coupon.discountValue) / 100;
      } else {
        discountAmount = Math.min(orderTotal, coupon.discountValue);
      }

      return NextResponse.json({
        valid: true,
        coupon,
        discountAmount: Math.round(discountAmount * 100) / 100,
      });
    }

    return NextResponse.json({ coupons: db.coupons });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao consultar cupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const code = (body.code || '').trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 });
    }

    const existing = db.coupons.find((c) => c.code.toUpperCase() === code);
    if (existing) {
      return NextResponse.json({ error: 'Já existe um cupom cadastrado com este código' }, { status: 400 });
    }

    const newCoupon: Coupon = {
      id: body.id || `cup-${Date.now()}`,
      code,
      description: body.description || '',
      discountType: body.discountType === 'fixed' ? 'fixed' : 'percent',
      discountValue: Number(body.discountValue) || 10,
      minOrderValue: body.minOrderValue ? Number(body.minOrderValue) : undefined,
      maxUses: body.maxUses ? Number(body.maxUses) : undefined,
      usedCount: 0,
      validFrom: body.validFrom || new Date().toISOString().split('T')[0],
      validTo: body.validTo || '2026-12-31',
      active: body.active !== undefined ? !!body.active : true,
      isBirthdayCoupon: !!body.isBirthdayCoupon,
    };

    db.coupons.push(newCoupon);
    saveDatabase(db);

    logAudit('CUPOM_CRIADO', 'Cupons', `Cupom "${newCoupon.code}" criado com ${newCoupon.discountValue}${newCoupon.discountType === 'percent' ? '%' : ' R$'}.`, newCoupon.id);

    return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID do cupom obrigatório' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.coupons.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    db.coupons[index] = {
      ...db.coupons[index],
      ...updates,
    };
    saveDatabase(db);

    logAudit('CUPOM_EDITADO', 'Cupons', `Cupom "${db.coupons[index].code}" atualizado.`, id);

    return NextResponse.json({ success: true, coupon: db.coupons[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar cupom' }, { status: 500 });
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
    const index = db.coupons.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    const removed = db.coupons.splice(index, 1)[0];
    saveDatabase(db);

    logAudit('CUPOM_EXCLUIDO', 'Cupons', `Cupom "${removed.code}" excluído.`, id);

    return NextResponse.json({ success: true, message: `Cupom ${removed.code} excluído.` });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir cupom' }, { status: 500 });
  }
}
