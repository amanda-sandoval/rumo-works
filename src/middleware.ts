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
  const host = request.headers.get('host') || '';

  // 1. Governança estrita: Bloquear ferramentas legadas
  const isBlocked = PROTECTED_LEGACY_ROUTES.some((route) => {
    return (
      pathname === route ||
      pathname.startsWith(`${route}/`) ||
      pathname === `/api${route}` ||
      pathname.startsWith(`/api${route}/`)
    );
  });

  if (isBlocked) {
    return new NextResponse('Página não encontrada (404)', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // 2. Roteamento do Subdomínio Mapa Rumo (ex: mapa.rumoworkshub.com.br ou mapa.localhost)
  const isMapaSubdomain = host.startsWith('mapa.') || host.includes('mapa-rumo');

  if (isMapaSubdomain) {
    // Ignorar requisições internas do Next.js, API e assets estáticos
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.') // arquivos estáticos (.svg, .png, etc.)
    ) {
      return NextResponse.next();
    }

    // Se o subdomínio já estiver acessando /mapa, deixa passar
    if (pathname.startsWith('/mapa')) {
      return NextResponse.next();
    }

    // Reescreve a raiz e subrotas do subdomínio para a aplicação /mapa
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = `/mapa${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
