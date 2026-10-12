import type { Metadata } from 'next';

export const metadata: Metadata = {
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
