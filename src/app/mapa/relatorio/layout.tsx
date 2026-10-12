import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seu Relatório | Mapa Rumo',
  description: 'Relatório individual de diagnóstico e desenvolvimento profissional do Mapa Rumo.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RelatorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
