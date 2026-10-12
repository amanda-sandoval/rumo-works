import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Questionário | Mapa Rumo',
  description: 'Questionário interativo de diagnóstico profissional e autoconhecimento do Mapa Rumo.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function QuestionarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
