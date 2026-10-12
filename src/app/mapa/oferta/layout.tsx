import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Relatório Completo | Mapa Rumo',
  description: 'Acesso ao relatório completo e plano de ação de 30 dias do diagnóstico Mapa Rumo.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function OfertaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
