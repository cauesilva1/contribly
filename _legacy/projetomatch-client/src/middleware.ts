import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("Middleware executado para:", request.url);

  // Obtenha o token do cookie
  const token = request.cookies.get("access_token")?.value;
  console.log("Token encontrado:", token);

  // Verifique se o token está presente
  if (token && request.nextUrl.pathname === "/") {
    console.log("Usuário logado tentando acessar a página inicial. Redirecionando para /InicialPage.");
    return NextResponse.redirect(new URL("/InicialPage", request.url));
  }

  // Verifique se o token está ausente para rotas protegidas
  if (!token && ["/Profile", "/ProjectPage", "/InicialPage"].some((path) => request.nextUrl.pathname.startsWith(path))) {
    console.log("Token ausente. Redirecionando para a página inicial.");
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log("Token válido ou rota pública. Permissão concedida.");
  return NextResponse.next();
}

// Defina as rotas protegidas e a página inicial
export const config = {
  matcher: ["/", "/Profile/:path*", "/ProjectPage/:path*", "/InicialPage/:path*"], // Rotas protegidas e página inicial
};