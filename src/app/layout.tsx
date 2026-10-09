import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ConditionalShell } from '@/components/ConditionalShell';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  metadataBase: new URL('https://rumoworks.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="bg-[#FAF8F5] text-[#1A1816] min-h-screen flex flex-col font-sans antialiased selection:bg-sage-700 selection:text-white">
        <LanguageProvider>
          <ConditionalShell>
            {children}
          </ConditionalShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
