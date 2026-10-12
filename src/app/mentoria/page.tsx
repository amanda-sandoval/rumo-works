import type { Metadata } from 'next';
import React from 'react';
import { MentoriaLandingView } from './MentoriaLandingView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Mentoria de Carreira 1:1 | Rumo Works',
  description:
    'Desenvolvimento profissional conduzido com escuta ativa, rigor analítico e foco em ação. Sessões individuais de mentoria de carreira com Amanda Sandoval.',
  alternates: {
    canonical: `${siteConfig.url}/mentoria`,
  },
  openGraph: {
    title: 'Mentoria de Carreira 1:1 | Rumo Works',
    description:
      'Desenvolvimento profissional individual conduzido com escuta ativa, rigor analítico e foco em ação.',
    url: `${siteConfig.url}/mentoria`,
    siteName: siteConfig.name,
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/brand/rumo-works-logo-full.png',
        width: 1200,
        height: 630,
        alt: 'Mentoria Rumo Works - Amanda Sandoval',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentoria de Carreira 1:1 | Rumo Works',
    description:
      'Desenvolvimento profissional individual conduzido com escuta ativa, rigor analítico e foco em ação.',
    images: ['/brand/rumo-works-logo-full.png'],
  },
};

export default function MentoriaPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mentoria',
        item: `${siteConfig.url}/mentoria`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MentoriaLandingView />
    </>
  );
}
