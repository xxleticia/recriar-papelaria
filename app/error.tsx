'use client';

import React, { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If it's a chunk loading failure (stale cache after rebuild or network hiccup), auto-reload once
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError');

    if (isChunkError) {
      const storageKey = 'last_chunk_reload_ts';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      const now = Date.now();
      if (now - lastReload > 4000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
        return;
      }
    }

    console.error('Unhandled app error:', error);
  }, [error]);

  const isChunk =
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('ChunkLoadError');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9] text-[#5C4033] p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-[#C49A45]/20 flex items-center justify-center mb-4 text-[#C49A45]">
        <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <h2 className="text-2xl font-serif font-bold text-[#5C4033] mb-2">
        {isChunk ? 'Atualizando Sistema...' : 'Algo deu errado'}
      </h2>
      <p className="text-sm text-stone-600 max-w-md mb-6">
        {isChunk
          ? 'Uma nova versão do sistema foi disponibilizada ou houve uma oscilação de conexão. Atualizando para os arquivos mais recentes...'
          : 'Ocorreu uma falha inesperada no processamento da página. Você pode tentar recarregar o sistema.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="px-6 py-2.5 bg-[#C49A45] hover:bg-[#b08736] text-white font-medium text-sm rounded-full shadow transition"
        >
          Recarregar Página
        </button>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-sm rounded-full transition"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
