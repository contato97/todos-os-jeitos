import type { SupabaseClient } from "@supabase/supabase-js";
import { BOTAO_DISCRETO, Cartao, Etiqueta, formatarData } from "@/components/ui";
import { rotuloProfissao } from "@/lib/opcoes-cadastro";

export type RegistroEspecialista = {
  id: string;
  tipo: string;
  texto: string;
  created_at: string;
  especialista_id: string;
  autor: string | null;
  profissao: string | null;
};

type EspecialistaEmbutido = { profissao: string; perfis: { nome: string } | { nome: string }[] | null } | null | undefined;

// Busca os registros que o usuario logado pode ver (o RLS filtra:
// a escola, por exemplo, recebe so as orientacoes, nunca as clinicas)
export async function buscarRegistrosEspecialistas(supabase: SupabaseClient, alunoId: string): Promise<RegistroEspecialista[]> {
  const { data } = await supabase
    .from("especialista_registros")
    .select("id, tipo, texto, created_at, especialista_id, especialistas(profissao, perfis(nome))")
    .eq("aluno_id", alunoId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => {
    const esp = (Array.isArray(r.especialistas) ? r.especialistas[0] : r.especialistas) as EspecialistaEmbutido;
    const perfil = Array.isArray(esp?.perfis) ? esp?.perfis[0] : esp?.perfis;
    return {
      id: r.id,
      tipo: r.tipo,
      texto: r.texto,
      created_at: r.created_at,
      especialista_id: r.especialista_id,
      autor: perfil?.nome ?? null,
      profissao: esp?.profissao ?? null,
    };
  });
}

// Lista de registros. "apagar" so aparece nos registros do proprio especialista.
export function RegistrosEspecialistas({
  registros,
  apagar,
  meuId,
}: {
  registros: RegistroEspecialista[];
  apagar?: (id: string) => Promise<void>;
  meuId?: string;
}) {
  return (
    <ul className="space-y-3">
      {registros.map((r) => (
        <li key={r.id}>
          <Cartao>
            <div className="flex flex-wrap items-center gap-2">
              <Etiqueta tipo={r.tipo === "clinico" ? "casa" : "compartilhado"}>
                {r.tipo === "clinico" ? "Informação clínica 🔒" : "Orientação"}
              </Etiqueta>
              <span className="text-base">
                {[r.autor, r.profissao && rotuloProfissao(r.profissao), formatarData(r.created_at)].filter(Boolean).join(" · ")}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-line">{r.texto}</p>
            {apagar && r.especialista_id === meuId && (
              <form action={apagar.bind(null, r.id)} className="mt-2">
                <button type="submit" className={BOTAO_DISCRETO}>
                  Apagar
                </button>
              </form>
            )}
          </Cartao>
        </li>
      ))}
    </ul>
  );
}
