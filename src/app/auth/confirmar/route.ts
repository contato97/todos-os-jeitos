import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { AREA_DO_PERFIL, type TipoPerfil } from "@/lib/auth";
import { enviarEmail } from "@/lib/email/enviar";
import { boasVindasEscola, boasVindasProfessor } from "@/lib/email/modelos";
import { destinoSeguro } from "@/lib/formulario";
import { criarClienteServidor } from "@/lib/supabase/server";

// Destino dos links enviados por e-mail (confirmar conta, recuperar senha).
// Troca o codigo do link por uma sessao e leva a pessoa para o lugar certo.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const tipo = params.get("type") as EmailOtpType | null;
  const codigo = params.get("code");
  const proximo = destinoSeguro(params.get("proximo"));

  const supabase = await criarClienteServidor();
  let resultado;
  if (tokenHash && tipo) {
    resultado = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
  } else if (codigo) {
    resultado = await supabase.auth.exchangeCodeForSession(codigo);
  }

  const destino = request.nextUrl.clone();
  destino.search = "";

  const usuario = resultado?.data.user;
  if (resultado?.error || !usuario) {
    destino.pathname = "/login";
    destino.searchParams.set("aviso", "link-invalido");
    return NextResponse.redirect(destino);
  }

  const { data: perfil } = await supabase.from("perfis").select("tipo, nome").eq("id", usuario.id).single();
  if (perfil && usuario.email) {
    await enviarBoasVindas(supabase, perfil.tipo as TipoPerfil, perfil.nome, usuario.email, request.nextUrl.origin);
  }

  destino.pathname = proximo ?? (perfil ? AREA_DO_PERFIL[perfil.tipo as TipoPerfil] : "/");
  return NextResponse.redirect(destino);
}

// Professor e escola recebem as boas-vindas ao confirmar o e-mail.
// A familia recebe depois do consentimento (ver familia/acoes.ts).
async function enviarBoasVindas(supabase: SupabaseClient, tipo: TipoPerfil, nome: string, email: string, site: string) {
  if (tipo === "familia") return;
  // Devolve true so na primeira vez: ninguem recebe o e-mail duas vezes
  const { data: enviar } = await supabase.rpc("marcar_boas_vindas");
  if (!enviar) return;

  if (tipo === "professor") {
    await enviarEmail(email, boasVindasProfessor({ nome, site }));
  } else {
    const { data: escola } = await supabase.from("escolas").select("nome").maybeSingle();
    await enviarEmail(email, boasVindasEscola({ nome, escola: escola?.nome ?? "sua escola", site }));
  }
}
