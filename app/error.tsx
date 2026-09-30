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
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9] text-[#5C4033] p-6 text-center">
      <h2 className="text-2xl font-serif font-bold text-[#5C4033] mb-3">Algo deu errado</h2>
      <p className="text-sm text-stone-600 max-w-md mb-6">
        Ocorreu uma falha inesperada no processamento da página. Você pode tentar recarregar o sistema.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-[#C49A45] hover:bg-[#b08736] text-white font-medium text-sm rounded-full shadow transition"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
