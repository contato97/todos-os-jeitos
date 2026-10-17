import "server-only";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

export type TipoPerfil = "professor" | "familia" | "escola";

export type Usuario = {
  id: string;
  tipo: TipoPerfil;
  nome: string;
};

// Pagina inicial de cada tipo de perfil
export const AREA_DO_PERFIL: Record<TipoPerfil, string> = {
  professor: "/professor",
  escola: "/escola",
  familia: "/familia",
};

// Camada unica de acesso ao usuario logado: toda pagina protegida passa por aqui.
// Devolve so o necessario (id, tipo, nome), nunca o token ou o objeto completo.
export async function buscarUsuario(): Promise<Usuario | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;

  // O RLS garante que esta consulta so devolve o perfil do proprio usuario
  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, tipo, nome")
    .eq("id", id)
    .single();

  return perfil ?? null;
}

// Exige login e, se informado, um tipo de perfil especifico.
// Quem e de outro tipo e mandado para a propria area.
export async function exigirUsuario(tipo?: TipoPerfil): Promise<Usuario> {
  const usuario = await buscarUsuario();
  if (!usuario) redirect("/login");
  if (tipo && usuario.tipo !== tipo) redirect(AREA_DO_PERFIL[usuario.tipo]);
  return usuario;
}
