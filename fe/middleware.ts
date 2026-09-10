import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Na primeira visita (sem escolha de idioma salva ainda), decide o idioma
  // pelo país detectado via geo-IP do próprio Vercel, em vez do idioma do
  // navegador — depois disso o next-intl guarda a escolha num cookie e
  // respeita normalmente (inclusive se o usuário trocar manualmente).
  if (!request.cookies.has("NEXT_LOCALE")) {
    const country = request.headers.get("x-vercel-ip-country");
    const locale = country === "BR" ? "pt-BR" : "en";

    const headers = new Headers(request.headers);
    headers.set("accept-language", locale);
    request = new NextRequest(request, { headers });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
