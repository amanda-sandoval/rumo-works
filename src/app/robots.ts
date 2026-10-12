import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url || 'https://www.rumoworkshub.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/cv-lab/',
          '/interview-lab/',
          '/application-pack/',
          '/offer-negotiator/',
          '/level-calibration/',
          '/career-source/',
          '/story-lab/',
          '/mapa/checkout/',
          '/mapa/questionario/',
          '/mapa/previa/',
          '/mapa/oferta/',
          '/mapa/relatorio/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
