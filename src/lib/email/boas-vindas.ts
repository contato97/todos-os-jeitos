import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TipoPerfil } from "@/lib/auth";
import { enviarEmail } from "./enviar";
import { boasVindasEscola, boasVindasProfessor } from "./modelos";

// Boas-vindas de professor e escola. Chamado em dois momentos:
// - ao confirmar o e-mail (link do Supabase -> /auth/confirmar)
// - logo apos o cadastro, quando a confirmacao por e-mail esta desligada
// A familia recebe depois do consentimento (familia/acoes.ts).
// O banco garante que sai uma unica vez por pessoa (marcar_boas_vindas).
export async function enviarBoasVindas(supabase: SupabaseClient, tipo: TipoPerfil, nome: string, email: string, site: string) {
  if (tipo === "familia") return;
  const { data: enviar } = await supabase.rpc("marcar_boas_vindas");
  if (!enviar) return;

  if (tipo === "professor") {
    await enviarEmail(email, boasVindasProfessor({ nome, site }));
  } else {
    const { data: escola } = await supabase.from("escolas").select("nome").maybeSingle();
    await enviarEmail(email, boasVindasEscola({ nome, escola: escola?.nome ?? "sua escola", site }));
  }
}
