import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO, Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { PAGINAS_POR_CREDITO } from "@/lib/ia/precos";
import { creditosUsadosNoMes } from "@/lib/ia/uso";
import { criarClienteServidor } from "@/lib/supabase/server";
import { AdaptarComEscolha } from "./adaptar-com-escolha";
import { ResultadoAdaptacao } from "./resultado";

export default function PaginaAdaptar({ searchParams }: PageProps<"/professor/adaptar">) {
  return (
    <>
      <h1 className="text-3xl font-semibold">Adaptar atividade com a IA</h1>
      <p className="mt-1 max-w-2xl">
        Envie a atividade do jeito que tiver: foto da folha, PDF, Word ou texto. A IA adapta pelo perfil do aluno e você
        revisa antes de usar.
      </p>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_PROFESSOR.atividades} />
      </div>
      <Suspense fallback={<Carregando />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Conteudo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { aluno, atividade } = await searchParams;
  // Depois de adaptar, a propria tela mostra o resultado para revisar e baixar
  if (typeof atividade === "string") return <ResultadoAdaptacao atividadeId={atividade} />;

  const supabase = await criarClienteServidor();
  const [{ data: alunos }, { data: recentes }, creditos] = await Promise.all([
    supabase.from("alunos").select("id, nome, ano_escolar").order("nome"),
    supabase
      .from("atividades")
      .select("id, titulo, status, aluno_id, created_at, alunos(nome)")
      .order("created_at", { ascending: false })
      .limit(6),
    creditosUsadosNoMes(),
  ]);

  if (!alunos?.length) {
    return (
      <Vazio>
        Para adaptar uma atividade, cadastre primeiro um aluno: a IA usa o perfil dele.{" "}
        <Link href="/professor/alunos/novo" className="font-medium underline underline-offset-4">
          Cadastrar aluno
        </Link>
      </Vazio>
    );
  }

  const inicial =
    typeof aluno === "string" && alunos.some((a) => a.id === aluno) ? aluno : alunos.length === 1 ? alunos[0].id : "";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Cartao className="min-w-0">
        <AdaptarComEscolha alunos={alunos} inicial={inicial} />
      </Cartao>
      <div className="flex h-fit flex-col gap-6">
        <Cartao>
          <h2 className="text-lg font-semibold">Créditos de IA este mês</h2>
          <p className="mt-1 text-3xl font-semibold">{creditos}</p>
          <p className="mt-2 text-base">
            Cada adaptação usa 1 crédito a cada {PAGINAS_POR_CREDITO} páginas (fotos, páginas do PDF ou do Word). Uma
            folha usa 1 crédito; uma prova de 6 páginas usa 3.
          </p>
        </Cartao>
        <Cartao>
          <h2 className="text-lg font-semibold">Últimas adaptações</h2>
          {!recentes?.length ? (
            <p className="mt-2">As atividades adaptadas aparecem aqui.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recentes.map((a) => {
                const al = Array.isArray(a.alunos) ? a.alunos[0] : a.alunos;
                return (
                  <li key={a.id}>
                    <Link
                      href={`/professor/alunos/${a.aluno_id}/atividades/${a.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {a.titulo}
                    </Link>
                    <p className="flex flex-wrap items-center gap-2 text-base">
                      {al?.nome} · {formatarData(a.created_at)}
                      {a.status === "rascunho" ? (
                        <Etiqueta tipo="rascunho">Rascunho</Etiqueta>
                      ) : (
                        <Etiqueta tipo="revisado">Revisada</Etiqueta>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/professor/alunos" className={`${BOTAO} mt-4 w-full`}>
            Ver por aluno
          </Link>
        </Cartao>
      </div>
    </div>
  );
}
