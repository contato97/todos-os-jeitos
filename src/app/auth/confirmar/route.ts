import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { AREA_DO_PERFIL, type TipoPerfil } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";

// Destino dos links enviados por e-mail (confirmar conta, recuperar senha).
// Troca o codigo do link por uma sessao e leva a pessoa para o lugar certo.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const tipo = params.get("type") as EmailOtpType | null;
  const codigo = params.get("code");
  const proximo = params.get("proximo");

  const supabase = await criarClienteServidor();
  let resultado;
  if (tokenHash && tipo) {
    resultado = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
  } else if (codigo) {
    resultado = await supabase.auth.exchangeCodeForSession(codigo);
  }

  const destino = request.nextUrl.clone();
  destino.search = "";

  const usuarioId = resultado?.data.user?.id;
  if (resultado?.error || !usuarioId) {
    destino.pathname = "/login";
    destino.searchParams.set("aviso", "link-invalido");
    return NextResponse.redirect(destino);
  }

  // So aceita destinos internos (comecando com "/"), para o link nao ser
  // usado para mandar a pessoa a um site falso
  if (proximo?.startsWith("/") && !proximo.startsWith("//")) {
    destino.pathname = proximo;
    return NextResponse.redirect(destino);
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo")
    .eq("id", usuarioId)
    .single();
  destino.pathname = perfil ? AREA_DO_PERFIL[perfil.tipo as TipoPerfil] : "/";
  return NextResponse.redirect(destino);
}
