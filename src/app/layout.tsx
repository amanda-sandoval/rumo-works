import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ConditionalShell } from '@/components/ConditionalShell';
import { CookieConsentManager } from '@/components/privacy/CookieConsentManager';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [
    'Rumo Works',
    'estratégia de carreira',
    'desenvolvimento de carreira',
    'mentoria de carreira',
    'desenvolvimento profissional',
    'autoconhecimento',
    'plano de evolução profissional',
    'transição de carreira',
    'liderança',
  ],
  authors: [{ name: 'Amanda Sandoval', url: 'https://www.linkedin.com/in/amandasandoval/' }],
  creator: 'Amanda Sandoval',
  category: 'estratégia e desenvolvimento de carreira',
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
        alt: 'Rumo Works - Estratégia e Desenvolvimento de Carreira',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/brand/rumo-works-logo-full.png'],
  },
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
        alternateName: ['Rumo Works Hub', 'RumoWorks'],
        url: siteConfig.url,
        logo: `${siteConfig.url}/brand/rumo-works-logo-full.png`,
        description: siteConfig.description,
        email: siteConfig.contactEmail,
        founder: {
          '@type': 'Person',
          name: 'Amanda Sandoval',
          url: 'https://www.linkedin.com/in/amandasandoval/',
          jobTitle: 'Mentora e Fundadora',
          sameAs: ['https://www.linkedin.com/in/amandasandoval/'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        alternateName: ['Rumo Works Hub', 'RumoWorks'],
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
        {/* Google Consent Mode v2 — Estados padrão (Denied) antes de qualquer medição */}
        <script
          id="google-consent-mode-default"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','functionality_storage':'granted','security_storage':'granted'});`,
          }}
        />
      </head>
      <body className="bg-[#FAF8F5] text-[#1A1816] min-h-screen flex flex-col font-sans antialiased selection:bg-sage-700 selection:text-white">
        <CookieConsentManager />
        <LanguageProvider>
          <ConditionalShell>
            {children}
          </ConditionalShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
