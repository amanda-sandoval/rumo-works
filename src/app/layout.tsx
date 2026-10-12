import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ConditionalShell } from '@/components/ConditionalShell';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [
    'Rumo Works',
    'rumo works',
    'rumoworks',
    'rumoworkshub',
    'rumoworkshub.com.br',
    'Rumo Works Hub',
    'Amanda Sandoval',
    'estratégia de carreira',
    'desenvolvimento de carreira',
    'mentoria de carreira',
    'mentoria executiva',
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
    canonical: '/',
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
        },
        sameAs: ['https://www.linkedin.com/in/amandasandoval/'],
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
      </head>
      <body className="bg-[#FAF8F5] text-[#1A1816] min-h-screen flex flex-col font-sans antialiased selection:bg-sage-700 selection:text-white">
        {/* Google Analytics 4 (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5E2ZTM446Z"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5E2ZTM446Z');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","ywdftpjaau");
          `}
        </Script>

        <LanguageProvider>
          <ConditionalShell>
            {children}
          </ConditionalShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
