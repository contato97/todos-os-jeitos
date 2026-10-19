import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { criarClienteServidor } from "@/lib/supabase/server";
import { HistoricoFamilia } from "./historico-familia";

// Historico do filho: so o que o professor compartilhou (o RLS garante)
export default function Historico({ params }: PageProps<"/familia/filhos/[id]">) {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.historico} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

type RelatorioFamilia = { id: string; periodo_inicio: string; periodo_fim: string; versao_familia: string | null };

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const [{ data: observacoes }, { data: atividades }, { data: relatorios }, { data: aluno }] = await Promise.all([
    supabase
      .from("observacoes")
      .select("id, texto, data_observacao")
      .eq("aluno_id", id)
      .eq("origem", "escola")
      .order("data_observacao", { ascending: false })
      .limit(30),
    supabase.from("atividades").select("id, titulo, conteudo_adaptado, atualizado_em").eq("aluno_id", id).order("atualizado_em", { ascending: false }),
    supabase.rpc("relatorios_para_familia", { p_aluno: id }),
    supabase.from("alunos").select("professor_id").eq("id", id).maybeSingle(),
  ]);
  const { data: professor } = aluno
    ? await supabase.from("perfis").select("nome").eq("id", aluno.professor_id).maybeSingle()
    : { data: null };
  const rels = (relatorios ?? []) as RelatorioFamilia[];

  return (
    <HistoricoFamilia
      id={id}
      professorNome={professor?.nome}
      relatorios={rels}
      atividades={atividades ?? []}
      observacoes={observacoes ?? []}
    />
  );
}
