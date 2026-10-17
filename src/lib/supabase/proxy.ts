import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Areas que exigem login. A checagem definitiva (e do tipo de perfil)
// acontece em cada pagina; aqui e so um desvio rapido para o login.
const AREAS_PROTEGIDAS = ["/professor", "/escola", "/familia", "/nova-senha"];

export async function atualizarSessao(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Sem as chaves no .env.local, a pagina publica continua funcionando
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Impede que um cache guarde a sessao de um usuario e entregue a outro
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // getClaims confere a assinatura do token e, se ele estiver vencendo, renova.
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims);

  const caminho = request.nextUrl.pathname;
  if (!logado && AREAS_PROTEGIDAS.some((area) => caminho.startsWith(area))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
