import type { Metadata } from 'next';
import React from 'react';
import { MapaLandingView } from './MapaLandingView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Mapa Rumo | Diagnóstico de Carreira e Autoconhecimento',
  description:
    'Descubra suas fontes de energia, padrões de ambiente e prioridades profissionais com o diagnóstico interativo Mapa Rumo. Versão inicial gratuita e relatório completo.',
  alternates: {
    canonical: `${siteConfig.url}/mapa`,
  },
  openGraph: {
    title: 'Mapa Rumo | Diagnóstico de Carreira e Autoconhecimento',
    description:
      'Descubra suas fontes de energia, padrões de ambiente e prioridades profissionais com o diagnóstico interativo Mapa Rumo.',
    url: `${siteConfig.url}/mapa`,
    siteName: siteConfig.name,
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/brand/rumo-works-logo-full.png',
        width: 1200,
        height: 630,
        alt: 'Mapa Rumo - Diagnóstico de Carreira',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mapa Rumo | Diagnóstico de Carreira e Autoconhecimento',
    description:
      'Descubra suas fontes de energia, padrões de ambiente e prioridades profissionais com o diagnóstico interativo Mapa Rumo.',
    images: ['/brand/rumo-works-logo-full.png'],
  },
};

export default function MapaPage() {
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
        name: 'Mapa Rumo',
        item: `${siteConfig.url}/mapa`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MapaLandingView />
    </>
  );
}
