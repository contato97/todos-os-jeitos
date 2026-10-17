import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_ESCOLA } from "@/lib/ajuda";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function VisaoGeralEscola() {
  const supabase = await criarClienteServidor();

  // Cada contagem ja passa pelo RLS: a escola so conta o que pode ver
  // (professores vinculados, alunos deles e itens revisados)
  const contar = async (tabela: string, filtro?: [string, string]) => {
    let consulta = supabase.from(tabela).select("*", { count: "exact", head: true });
    if (filtro) consulta = consulta.eq(filtro[0], filtro[1]);
    const { count } = await consulta;
    return count ?? 0;
  };

  const [{ data: escola }, professores, alunos, atividades, relatorios] = await Promise.all([
    supabase.from("escolas").select("nome").maybeSingle(),
    contar("escola_professores"),
    contar("alunos"),
    contar("atividades", ["status", "revisado"]),
    contar("relatorios", ["status", "revisado"]),
  ]);

  const numeros = [
    { rotulo: "Professores vinculados", valor: professores },
    { rotulo: "Alunos acompanhados", valor: alunos },
    { rotulo: "Atividades adaptadas", valor: atividades },
    { rotulo: "Relatórios revisados", valor: relatorios },
  ];

  return (
    <>
      <h1 className="text-3xl font-semibold">{escola?.nome ?? "Visão geral"}</h1>
      <p className="mt-2">Um retrato da inclusão na sua escola.</p>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_ESCOLA.visaoGeral} />
      </div>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {numeros.map((n) => (
          <div key={n.rotulo} className="rounded-2xl bg-white/70 p-5 ring-1 ring-marca/10">
            <dt>{n.rotulo}</dt>
            <dd className="mt-1 text-3xl font-semibold">{n.valor}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
