import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ConditionalShell } from '@/components/ConditionalShell';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [
    'Rumo Works',
    'rumo works',
    'rumoworks',
    'Amanda Sandoval',
    'mentoria voluntária',
    'mentoria de carreira',
    'desenvolvimento profissional',
    'autoconhecimento',
    'transição de carreira',
    'liderança',
    'planejamento profissional',
  ],
  authors: [{ name: 'Amanda Sandoval', url: 'https://www.linkedin.com/in/amandasandoval/' }],
  creator: 'Amanda Sandoval',
  category: 'education',
  alternates: {
    canonical: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'b2aWcJH4_IxbYGU2mqa8qS_M2D3cS5jIuQKY4-HhoJU',
  },
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
    images: [
      {
        url: '/brand/rumo-works-logo-full.png',
        width: 1200,
        height: 630,
        alt: 'Rumo Works - Mentoria Voluntária e Desenvolvimento Profissional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/brand/rumo-works-logo-full.png'],
  },
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org Structured Data for Google Rich Entity Indexing
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/brand/rumo-works-logo-full.png`,
        description: siteConfig.description,
        founder: {
          '@type': 'Person',
          name: 'Amanda Sandoval',
          url: 'https://www.linkedin.com/in/amandasandoval/',
          jobTitle: 'Mentora e Fundadora',
        },
        sameAs: ['https://www.linkedin.com/in/amandasandoval/'],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          '@id': `${siteConfig.url}/#organization`,
        },
        inLanguage: 'pt-BR',
      },
    ],
  };

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <meta name="google-site-verification" content="b2aWcJH4_IxbYGU2mqa8qS_M2D3cS5jIuQKY4-HhoJU" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
