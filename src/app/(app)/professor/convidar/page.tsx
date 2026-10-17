import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO_DISCRETO, Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { agoraIso } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/server";
import { cancelarConvite } from "../../acoes-convite";
import { ConvidarComEscolha } from "./convidar-com-escolha";

export default function PaginaConvidar({ searchParams }: PageProps<"/professor/convidar">) {
  return (
    <>
      <h1 className="text-3xl font-semibold">Convidar família</h1>
      <p className="mt-1 max-w-2xl">
        O responsável recebe um link, cria a conta e dá o consentimento no primeiro acesso. Você também pode mandar o link
        pelo WhatsApp.
      </p>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_PROFESSOR.familia} />
      </div>
      <Suspense fallback={<Carregando />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Conteudo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { aluno } = await searchParams;
  const supabase = await criarClienteServidor();
  const [{ data: alunos }, { data: convites }] = await Promise.all([
    supabase.from("alunos").select("id, nome, ano_escolar").order("nome"),
    supabase
      .from("convites")
      .select("id, email, expira_em, aluno_id, alunos(nome)")
      .eq("tipo", "familia")
      .is("usado_em", null)
      .order("created_at", { ascending: false }),
  ]);
  const agora = agoraIso();

  if (!alunos?.length) {
    return (
      <Vazio>
        Cadastre um aluno antes de convidar a família.{" "}
        <Link href="/professor/alunos/novo" className="font-medium underline underline-offset-4">
          Cadastrar aluno
        </Link>
      </Vazio>
    );
  }
  const inicial = typeof aluno === "string" && alunos.some((a) => a.id === aluno) ? aluno : alunos.length === 1 ? alunos[0].id : "";

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Cartao className="h-fit xl:col-span-3">
        <ConvidarComEscolha alunos={alunos} inicial={inicial} />
      </Cartao>
      <Cartao className="h-fit xl:col-span-2">
        <h2 className="text-lg font-semibold">Convites pendentes</h2>
        {!convites?.length ? (
          <p className="mt-2">Nenhum convite esperando resposta.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {convites.map((c) => {
              const al = Array.isArray(c.alunos) ? c.alunos[0] : c.alunos;
              return (
                <li key={c.id} className="flex flex-wrap items-start justify-between gap-2">
                  <span>
                    <span className="block font-medium">{c.email}</span>
                    <span className="text-base">
                      {al?.nome} ·{" "}
                      {c.expira_em < agora ? <Etiqueta tipo="rascunho">Expirado</Etiqueta> : `vale até ${formatarData(c.expira_em)}`}
                    </span>
                  </span>
                  <form action={cancelarConvite.bind(null, c.id)}>
                    <button type="submit" className={BOTAO_DISCRETO}>
                      Cancelar
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </Cartao>
    </div>
  );
}
