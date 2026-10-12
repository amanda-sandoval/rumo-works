import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prévia do Diagnóstico | Mapa Rumo',
  description: 'Prévia personalizada com as primeiras descobertas do diagnóstico Mapa Rumo.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PreviaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
