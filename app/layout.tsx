import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recriar - Papelaria Personalizada',
  description: 'Sistema completo de vitrine virtual e painel administrativo para papelaria personalizada, com precificação profissional, PDV, leitor de código de barras e gestão de pedidos.',
  openGraph: {
    title: 'Recriar - Papelaria Personalizada',
    description: 'Sistema completo de vitrine virtual e painel administrativo para papelaria personalizada, com precificação profissional, PDV, leitor de código de barras e gestão de pedidos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recriar - Papelaria Personalizada',
    description: 'Sistema completo de vitrine virtual e painel administrativo para papelaria personalizada, com precificação profissional, PDV, leitor de código de barras e gestão de pedidos.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-[#FFFDF9] text-[#5C4033] antialiased selection:bg-[#C49A45]/30">
        {children}
      </body>
    </html>
  );
}
