import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Guard-ul de sesiune rulează DOAR pe navigări (GET). Pe POST-urile
    // server-action getUser din middleware ar reîmprospăta token-ul, iar
    // redirect-ul acțiunii ar pierde cookie-urile → deconectare. Acțiunile
    // sunt oricum protejate de RLS (fw_is_admin) + requireAdmin în pagini.
    if (request.method !== "GET") {
      return NextResponse.next();
    }
    return updateSession(request);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
