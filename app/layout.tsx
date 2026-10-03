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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var msg = (e && e.message) || '';
                if (msg.indexOf('Loading chunk') !== -1 || msg.indexOf('ChunkLoadError') !== -1) {
                  var k = 'applet_last_chunk_err_reload';
                  var now = Date.now();
                  var last = parseInt(sessionStorage.getItem(k) || '0', 10);
                  if (now - last > 5000) {
                    sessionStorage.setItem(k, now.toString());
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-[#FFFDF9] text-[#5C4033] antialiased selection:bg-[#C49A45]/30">
        {children}
      </body>
    </html>
  );
}
