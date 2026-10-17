import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO, Cartao, Etiqueta, TextoFormatado, Vazio, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { criarClienteServidor } from "@/lib/supabase/server";
import { RecadoFamilia } from "./recado-familia";

// Comunicacao com as familias: tudo o que chegou de casa, num lugar so
export default function ComunicacaoFamilia() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Comunicação com a família</h1>
          <p className="mt-1 max-w-2xl">O que as famílias contaram de casa, os pedidos de reforço e quem já está conectado.</p>
        </div>
        <Link href="/professor/convidar" className={BOTAO}>
          Convidar família
        </Link>
      </div>
      <ComoUsar secao={AJUDA_PROFESSOR.comunicacao} />
      <Suspense fallback={<Carregando />}>
        <Conteudo />
      </Suspense>
    </>
  );
}

async function Conteudo() {
  const supabase = await criarClienteServidor();
  const [{ data: alunos }, { data: deCasa }, { data: reforcos }, { data: vinculos }] = await Promise.all([
    supabase.from("alunos").select("id, nome, ano_escolar").order("nome"),
    supabase
      .from("observacoes")
      .select("id, aluno_id, texto, data_observacao, perfis(nome)")
      .eq("origem", "casa")
      .order("data_observacao", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("reforcos").select("id, aluno_id, tipo, pedido, resposta, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("aluno_familias").select("aluno_id, familia_id, parentesco, consentimento_em, perfis(nome)"),
  ]);
  const nomeAluno = new Map((alunos ?? []).map((a) => [a.id, a.nome]));
  const um = <T,>(v: T | T[] | null) => (Array.isArray(v) ? v[0] : v);

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <div className="space-y-6 xl:col-span-3">
        <section aria-labelledby="titulo-casa">
          <h2 id="titulo-casa" className="mb-3 text-xl font-semibold">
            O que chegou de casa
          </h2>
          {!deCasa?.length ? (
            <Vazio>Quando as famílias contarem como foi em casa, aparece aqui.</Vazio>
          ) : (
            <ul className="space-y-3">
              {deCasa.map((o) => (
                <li key={o.id}>
                  <Cartao>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/professor/alunos/${o.aluno_id}/observacoes`} className="font-semibold underline-offset-4 hover:underline">
                        {nomeAluno.get(o.aluno_id)}
                      </Link>
                      <Etiqueta tipo="casa">{um(o.perfis)?.nome ?? "Família"}</Etiqueta>
                      <span className="text-base">{formatarData(o.data_observacao)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line">{o.texto}</p>
                  </Cartao>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="titulo-reforco">
          <h2 id="titulo-reforco" className="mb-3 text-xl font-semibold">
            Reforço em casa
          </h2>
          {!reforcos?.length ? (
            <Vazio>Os pedidos de reforço e de ajuda com a lição que as famílias fizerem aparecem aqui.</Vazio>
          ) : (
            <ul className="space-y-3">
              {reforcos.map((r) => (
                <li key={r.id}>
                  <Cartao>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{nomeAluno.get(r.aluno_id)}</span>
                      <Etiqueta tipo="casa">{r.tipo === "licao" ? "Lição de casa" : "Reforço"}</Etiqueta>
                      <span className="text-base">{formatarData(r.created_at, true)}</span>
                    </div>
                    <p className="mt-2">“{r.pedido}”</p>
                    {r.resposta && (
                      <details className="mt-2">
                        <summary className="cursor-pointer underline underline-offset-4">Ver a orientação que a família recebeu</summary>
                        <div className="mt-2">
                          <TextoFormatado texto={r.resposta} />
                        </div>
                      </details>
                    )}
                  </Cartao>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="space-y-6 xl:col-span-2">
        {alunos && alunos.length > 0 && (
          <Cartao>
            <h2 className="mb-4 text-xl font-semibold">Mandar recado</h2>
            <RecadoFamilia alunos={alunos} />
          </Cartao>
        )}

        <Cartao>
          <h2 className="text-xl font-semibold">Famílias conectadas</h2>
          {!alunos?.length ? (
            <p className="mt-2">Nenhum aluno cadastrado.</p>
          ) : (
            <ul className="mt-3 divide-y divide-marca/10">
              {alunos.map((a) => {
                const familias = (vinculos ?? []).filter((v) => v.aluno_id === a.id);
                return (
                  <li key={a.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{a.nome}</span>
                      {familias.length === 0 && (
                        <Link href={`/professor/convidar?aluno=${a.id}`} className="text-base underline underline-offset-4">
                          Convidar
                        </Link>
                      )}
                    </div>
                    {familias.map((f) => (
                      <p key={f.familia_id} className="mt-1 flex flex-wrap items-center gap-2 text-base">
                        {um(f.perfis)?.nome ?? "Familiar"}
                        {f.parentesco ? ` (${f.parentesco})` : ""}
                        {f.consentimento_em ? <Etiqueta tipo="revisado">Conectada</Etiqueta> : <Etiqueta tipo="rascunho">Aguardando consentimento</Etiqueta>}
                      </p>
                    ))}
                  </li>
                );
              })}
            </ul>
          )}
        </Cartao>
      </div>
    </div>
  );
}
