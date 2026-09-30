'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store-context';
import { Lock, KeyRound, AlertCircle, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export function AdminLoginView() {
  const { adminLogin, adminChangePassword, isTemporaryPassword } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // First access password change state
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await adminLogin(username.trim(), password);
    setIsLoading(false);

    if (res.success) {
      if (res.isTemp) {
        setOldPassword(password);
        setShowChangeModal(true);
      }
    } else {
      setErrorMsg(res.error || 'Credenciais inválidas.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    setIsLoading(true);
    const res = await adminChangePassword(oldPassword, newPassword);
    setIsLoading(false);

    if (res.success) {
      setChangeSuccess(true);
      setTimeout(() => {
        setShowChangeModal(false);
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Erro ao alterar a senha.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#B08968]/30 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#5C4033] text-white text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C49A45] flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-serif text-2xl font-bold">Painel do Ateliê</h2>
          <p className="text-xs text-[#F5EBDD]/80">
            Acesso administrativo restrito da Papelaria Recriar
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Usuário</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45] focus:outline-hidden text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#5C4033] hover:bg-[#432d23] text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-[#C49A45]" />
              <span>{isLoading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Force Password Change Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-[#C49A45]">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#5C4033]">
                Definir Nova Senha de Acesso
              </h3>
              <p className="text-xs text-gray-500">
                Por segurança, como este é seu primeiro acesso com a senha temporária, defina uma nova senha forte.
              </p>
            </div>

            {changeSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-semibold">
                ✓ Senha atualizada com sucesso! Redirecionando...
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nova Senha (mín. 6 caracteres)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha segura"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C49A45]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#5C4033] hover:bg-[#432d23] text-white font-bold rounded-xl transition"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
