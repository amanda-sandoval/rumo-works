import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout Seguro | Mapa Rumo',
  description: 'Área segura de finalização de acesso ao relatório completo e plano de ação do Mapa Rumo.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
