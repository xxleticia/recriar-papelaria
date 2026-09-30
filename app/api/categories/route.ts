import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logAudit, saveDatabase } from '@/lib/db';
import { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ categories: db.categories });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar categorias' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const slug = (body.name || 'nova-categoria')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newCategory: Category = {
      id: body.id || `cat-${Date.now()}`,
      name: body.name || 'Nova Categoria',
      slug: body.slug || slug,
      description: body.description || '',
      icon: body.icon || 'Folder',
      active: body.active !== undefined ? !!body.active : true,
      order: body.order || db.categories.length + 1,
    };

    db.categories.push(newCategory);
    saveDatabase(db);

    logAudit('CATEGORIA_CRIADA', 'Categorias', `Categoria "${newCategory.name}" adicionada.`, newCategory.id);

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar categoria' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID da categoria obrigatório' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    db.categories[index] = {
      ...db.categories[index],
      ...updates,
    };
    saveDatabase(db);

    logAudit('CATEGORIA_EDITADA', 'Categorias', `Categoria "${db.categories[index].name}" atualizada.`, id);

    return NextResponse.json({ success: true, category: db.categories[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 });
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
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    const removed = db.categories.splice(index, 1)[0];
    saveDatabase(db);

    logAudit('CATEGORIA_EXCLUIDA', 'Categorias', `Categoria "${removed.name}" excluída.`, id);

    return NextResponse.json({ success: true, message: `Categoria "${removed.name}" excluída.` });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 });
  }
}
