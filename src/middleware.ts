import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. 获取 Cookie (auth_token)
  const authToken = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 2. 【核心拦截逻辑】
  // 如果没有 Token，且访问路径是以 /config 开头
  if (!authToken && pathname.startsWith('/config')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    
    return NextResponse.redirect(url, { status: 302 });
  }

  // 3.  如果已经登录，且访问 /login，自动跳回后台
  if (authToken && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/config';
    return NextResponse.redirect(url);
  }

  // 4. 放行其他请求
  return NextResponse.next();
}

export const config = {
  // 匹配器：匹配所有路径，除了 API、静态资源文件
  // 确保匹配规则覆盖 /config 和 /login
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|static|.*\\.png|.*\\.jpg|.*\\.ico).*)'],
};