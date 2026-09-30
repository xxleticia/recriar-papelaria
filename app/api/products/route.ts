import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logAudit, saveDatabase } from '@/lib/db';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ products: db.products });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar produtos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newProduct: Product = {
      id: body.id || `prod-${Date.now()}`,
      name: body.name || 'Novo Produto',
      sku: body.sku || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: body.barcode || String(7890000000000 + Math.floor(Math.random() * 1000000)),
      categoryId: body.categoryId || (db.categories[0]?.id || 'cat-1'),
      description: body.description || '',
      price: Number(body.price) || 0,
      promotionalPrice: body.promotionalPrice ? Number(body.promotionalPrice) : null,
      minQuantity: Number(body.minQuantity) || 1,
      estimatedDays: Number(body.estimatedDays) || 5,
      photos: Array.isArray(body.photos) && body.photos.length > 0 ? body.photos : [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      ],
      isNew: !!body.isNew,
      isFeatured: !!body.isFeatured,
      onSale: !!body.onSale,
      active: body.active !== undefined ? !!body.active : true,
      stock: body.stock !== undefined && body.stock !== null ? Number(body.stock) : null,
      customizationConfig: body.customizationConfig || {
        allowCustomText: true,
        customTextLabel: 'Nome ou frase para gravação personalizada',
        allowImageUpload: true,
        allowNotes: true,
      },
      priceTiers: body.priceTiers || [],
      costComposition: body.costComposition || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    saveDatabase(db);

    logAudit('PRODUTO_CRIADO', 'Produtos', `Produto "${newProduct.name}" cadastrado. Código de barras: ${newProduct.barcode}`, newProduct.id);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar produto' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID do produto obrigatório' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const updatedProduct: Product = {
      ...db.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    db.products[index] = updatedProduct;
    saveDatabase(db);

    logAudit('PRODUTO_EDITADO', 'Produtos', `Produto "${updatedProduct.name}" atualizado.`, id);

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
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
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const removed = db.products.splice(index, 1)[0];
    saveDatabase(db);

    logAudit('PRODUTO_EXCLUIDO', 'Produtos', `Produto "${removed.name}" excluído.`, id);

    return NextResponse.json({ success: true, message: `Produto ${removed.name} excluído.` });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}
