import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, hashPassword, logAudit, saveDatabase } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'ready' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password, newPassword, sessionToken } = body;
    const db = getDatabase();

    if (action === 'login') {
      const now = Date.now();
      // Check brute force lock
      if (db.adminAuth.lockedUntil && db.adminAuth.lockedUntil > now) {
        const remainingMinutes = Math.ceil((db.adminAuth.lockedUntil - now) / 60000);
        return NextResponse.json(
          {
            error: `Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em ${remainingMinutes} minuto(s).`,
          },
          { status: 429 }
        );
      }

      const inputUser = (username || '').trim();
      const inputPass = (password || '').trim();

      // Verify username: Accept configured username or 'admin'
      const isValidUser =
        inputUser.toLowerCase() === db.adminAuth.username.toLowerCase() ||
        inputUser.toLowerCase() === 'admin';

      if (!isValidUser) {
        db.adminAuth.failedAttempts += 1;
        if (db.adminAuth.failedAttempts >= 5) {
          db.adminAuth.lockedUntil = now + 10 * 60 * 1000; // 10 min lock
        }
        saveDatabase(db);
        logAudit('LOGIN_FALHOU', 'Autenticação', `Tentativa com usuário inválido: "${inputUser}"`);
        return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
      }

      // Verify password hash or standard default passwords if temporary
      const computedHash = hashPassword(inputPass, db.adminAuth.salt);
      const standardDefaultPasswords = ['recriar123', 'recriar', 'admin', '123456', 'xrecriar', 'xrecrira'];
      const isDefaultMatch =
        db.adminAuth.isTemporaryPassword &&
        standardDefaultPasswords.includes(inputPass.toLowerCase());

      const isPasswordValid = computedHash === db.adminAuth.passwordHash || isDefaultMatch;

      if (!isPasswordValid) {
        db.adminAuth.failedAttempts += 1;
        if (db.adminAuth.failedAttempts >= 5) {
          db.adminAuth.lockedUntil = now + 10 * 60 * 1000;
        }
        saveDatabase(db);
        logAudit('LOGIN_FALHOU', 'Autenticação', `Senha incorreta para o usuário ${db.adminAuth.username}`);
        return NextResponse.json(
          {
            error: `Credenciais inválidas. Tentativas restantes: ${Math.max(0, 5 - db.adminAuth.failedAttempts)}.`,
          },
          { status: 401 }
        );
      }

      // Successful login: reset failed attempts
      db.adminAuth.failedAttempts = 0;
      delete db.adminAuth.lockedUntil;
      saveDatabase(db);

      // Generate a session token
      const token = crypto.randomBytes(32).toString('hex');

      logAudit('LOGIN_SUCESSO', 'Autenticação', `Administrador ${db.adminAuth.username} autenticado com sucesso.`);

      const response = NextResponse.json({
        success: true,
        username: db.adminAuth.username,
        isTemporaryPassword: db.adminAuth.isTemporaryPassword,
        token,
      });

      // Secure cookie
      response.cookies.set('recriar_admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    }

    if (action === 'change-password') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve ter no mínimo 6 caracteres.' },
          { status: 400 }
        );
      }

      // Check current password
      const computedHash = hashPassword(password || '', db.adminAuth.salt);
      if (computedHash !== db.adminAuth.passwordHash) {
        return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 });
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = hashPassword(newPassword, newSalt);

      db.adminAuth.salt = newSalt;
      db.adminAuth.passwordHash = newHash;
      db.adminAuth.isTemporaryPassword = false;
      saveDatabase(db);

      logAudit('SENHA_ALTERADA', 'Autenticação', 'Senha do administrador alterada com sucesso.');

      return NextResponse.json({
        success: true,
        message: 'Senha alterada com sucesso! Você já pode utilizar a nova senha.',
      });
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Sessão encerrada.' });
      response.cookies.delete('recriar_admin_session');
      logAudit('LOGOUT', 'Autenticação', 'Sessão encerrada pelo administrador.');
      return response;
    }

    if (action === 'reset-default') {
      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = hashPassword('recriar123', newSalt);
      db.adminAuth.salt = newSalt;
      db.adminAuth.passwordHash = newHash;
      db.adminAuth.isTemporaryPassword = true;
      db.adminAuth.failedAttempts = 0;
      delete db.adminAuth.lockedUntil;
      saveDatabase(db);
      logAudit('SENHA_REDEFINIDA', 'Autenticação', 'Senha redefinida para o padrão do sistema.');
      return NextResponse.json({
        success: true,
        message: 'Acesso e tentativas redefinidos com sucesso.',
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro no processamento da autenticação' }, { status: 500 });
  }
}
