import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO, Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_ESCOLA } from "@/lib/ajuda";
import { dadosDaEscola } from "../dados";
import type { ResumoAluno } from "../painel-escola";

const FILTROS = [
  { valor: "", rotulo: "Todos" },
  { valor: "sem-atividade", rotulo: "Sem atividade adaptada" },
  { valor: "sem-familia", rotulo: "Sem família conectada" },
];

export default function AlunosEscola({ searchParams }: PageProps<"/escola/alunos">) {
  return (
    <>
      <h1 className="text-3xl font-semibold">Alunos</h1>
      <p className="mt-1">Alunos acompanhados pelos professores vinculados à escola.</p>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_ESCOLA.alunos} />
      </div>
      <Suspense fallback={<Carregando />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Conteudo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const busca = await searchParams;
  const texto = typeof busca.q === "string" ? busca.q.trim() : "";
  const professorId = typeof busca.professor === "string" ? busca.professor : "";
  const filtro = typeof busca.filtro === "string" ? busca.filtro : "";

  const { supabase, professores } = await dadosDaEscola();
  const [{ data: alunos }, { data: resumo }] = await Promise.all([
    supabase.from("alunos").select("id, nome, ano_escolar, professor_id").order("nome"),
    supabase.rpc("resumo_escola_alunos"),
  ]);
  const nomeProf = new Map(professores.map((p) => [p.id, p.nome]));
  const info = new Map(((resumo ?? []) as (ResumoAluno & { ultima_observacao: string | null })[]).map((r) => [r.aluno_id, r]));

  const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const lista = (alunos ?? []).filter((a) => {
    const i = info.get(a.id);
    if (texto && !normalizar(a.nome).includes(normalizar(texto))) return false;
    if (professorId && a.professor_id !== professorId) return false;
    if (filtro === "sem-atividade" && (i?.atividades_revisadas ?? 0) > 0) return false;
    if (filtro === "sem-familia" && i?.familia_conectada) return false;
    return true;
  });

  return (
    <>
      {/* Formulario simples (GET): os filtros ficam no endereco, da para salvar e compartilhar */}
      <Cartao className="mb-6">
        <form className="grid items-end gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor="q" className="font-medium">Buscar pelo nome</label>
            <input id="q" name="q" defaultValue={texto} className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 focus:border-petroleo" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor="professor" className="font-medium">Professor(a)</label>
            <select id="professor" name="professor" defaultValue={professorId} className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 focus:border-petroleo">
              <option value="">Todos</option>
              {professores.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor="filtro" className="font-medium">Mostrar</label>
            <select id="filtro" name="filtro" defaultValue={filtro} className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 focus:border-petroleo">
              {FILTROS.map((f) => (
                <option key={f.valor} value={f.valor}>{f.rotulo}</option>
              ))}
            </select>
          </div>
          <button type="submit" className={BOTAO}>Filtrar</button>
        </form>
      </Cartao>

      <p className="mb-3" role="status">
        {lista.length} aluno(s){texto || professorId || filtro ? " encontrados" : ""}.
        {(texto || professorId || filtro) && (
          <>
            {" "}
            <Link href="/escola/alunos" className="underline underline-offset-4">Limpar filtros</Link>
          </>
        )}
      </p>

      {!lista.length ? (
        <Vazio>
          {alunos?.length ? "Nenhum aluno com esses filtros." : "Quando os professores vinculados cadastrarem alunos, eles aparecem aqui."}
        </Vazio>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((a) => {
            const i = info.get(a.id);
            return (
              <li key={a.id}>
                <Link href={`/escola/alunos/${a.id}`} className="block h-full">
                  <Cartao className="h-full hover:ring-petroleo">
                    <p className="text-lg font-semibold">{a.nome}</p>
                    <p className="text-base">
                      {a.ano_escolar ? `${a.ano_escolar} · ` : ""}
                      {nomeProf.get(a.professor_id)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Etiqueta>{i?.atividades_revisadas ?? 0} atividade(s)</Etiqueta>
                      {i?.familia_conectada ? <Etiqueta tipo="revisado">Família conectada</Etiqueta> : <Etiqueta>Sem família</Etiqueta>}
                    </div>
                    <p className="mt-2 text-base">
                      {i?.ultima_observacao ? `Última observação: ${formatarData(i.ultima_observacao)}` : "Sem observações ainda"}
                    </p>
                  </Cartao>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
