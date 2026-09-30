import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9] text-[#5C4033] p-4 text-center">
      <h2 className="text-4xl font-serif font-bold text-[#8C6D3B] mb-2">404</h2>
      <p className="text-lg font-medium mb-6">Página não encontrada</p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-[#C49A45] hover:bg-[#B38934] text-white font-medium shadow-sm transition-all"
      >
        Voltar para a Loja
      </Link>
    </div>
  );
}
