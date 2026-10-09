import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rumo Works — Middleware de Proteção e Governança de Rotas
 * 
 * Bloqueia o acesso público a ferramentas internas e protótipos legados
 * (simulações de entrevistas, candidaturas a vagas, pacotes de aplicação)
 * garantindo conformidade estrita com o posicionamento público da Rumo Works:
 * iniciativa voluntária e gratuita de desenvolvimento profissional geral.
 */
const PROTECTED_LEGACY_ROUTES = [
  '/interview-lab',
  '/application-pack',
  '/offer-negotiator',
  '/level-calibration',
  '/story-lab',
  '/career-source',
  '/dashboard',
  '/cv-lab',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isBlocked = PROTECTED_LEGACY_ROUTES.some((route) => {
    return (
      pathname === route ||
      pathname.startsWith(`${route}/`) ||
      pathname === `/api${route}` ||
      pathname.startsWith(`/api${route}/`)
    );
  });

  if (isBlocked) {
    // Retorna 404 imediato sem expor o layout ou qualquer conteúdo
    return new NextResponse('Página não encontrada (404)', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/interview-lab/:path*',
    '/application-pack/:path*',
    '/offer-negotiator/:path*',
    '/level-calibration/:path*',
    '/story-lab/:path*',
    '/career-source/:path*',
    '/dashboard/:path*',
    '/cv-lab/:path*',
    '/api/cv-lab/:path*',
    '/api/interview-lab/:path*',
    '/api/application-pack/:path*',
    '/api/level-calibration/:path*',
    '/api/offer-negotiator/:path*',
    '/api/story-lab/:path*',
    '/api/career-source/:path*',
  ],
};
