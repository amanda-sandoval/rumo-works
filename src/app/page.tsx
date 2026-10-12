import type { Metadata } from 'next';
import React from 'react';
import { HomeLandingView } from './HomeLandingView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Rumo Works | Estratégia e Desenvolvimento de Carreira',
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: 'Rumo Works | Estratégia e Desenvolvimento de Carreira',
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
    title: 'Rumo Works | Estratégia e Desenvolvimento de Carreira',
    description: siteConfig.description,
    images: ['/brand/rumo-works-logo-full.png'],
  },
};

export default function HomePage() {
  return <HomeLandingView />;
}
