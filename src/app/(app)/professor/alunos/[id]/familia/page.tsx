import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { FormularioConvite } from "@/components/area/formulario-convite";
import { BOTAO_DISCRETO, Cartao, Etiqueta, TextoFormatado, Vazio, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { agoraIso } from "@/lib/datas";
import { rotuloTipoReforco } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";
import { cancelarConvite, convidarFamilia } from "../../../../acoes-convite";
import { removerFamilia } from "../../../acoes";

export default function Familia({ params }: PageProps<"/professor/alunos/[id]/familia">) {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.familia} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const [{ data: vinculos }, { data: convites }, { data: reforcos }, { data: feitas }] = await Promise.all([
    supabase.from("aluno_familias").select("familia_id, parentesco, consentimento_em, perfis(nome)").eq("aluno_id", id),
    supabase
      .from("convites")
      .select("id, email, expira_em, created_at")
      .eq("aluno_id", id)
      .is("usado_em", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("reforcos")
      .select("id, tipo, materia, pedido, resposta, created_at")
      .eq("aluno_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("reforco_realizacoes").select("reforco_id, respostas, como_foi, observacao, feita_em").eq("aluno_id", id),
  ]);
  const feitaDe = new Map((feitas ?? []).map((f) => [f.reforco_id, f]));
  const agora = agoraIso();

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-2">
        <Cartao>
          <h2 className="text-xl font-semibold">Convidar a família</h2>
          <p className="mb-4 mt-1">O responsável recebe um link, cria a conta e dá o consentimento no primeiro acesso.</p>
          <FormularioConvite acao={convidarFamilia.bind(null, id)} comParentesco rotuloBotao="Criar convite" />
        </Cartao>

        {convites && convites.length > 0 && (
          <Cartao>
            <h2 className="text-lg font-semibold">Convites pendentes</h2>
            <ul className="mt-2 space-y-2">
              {convites.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {c.email}{" "}
                    {c.expira_em < agora ? <Etiqueta tipo="rascunho">Expirado</Etiqueta> : <span className="text-base">até {formatarData(c.expira_em)}</span>}
                  </span>
                  <form action={cancelarConvite.bind(null, c.id)}>
                    <button type="submit" className={BOTAO_DISCRETO}>
                      Cancelar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </Cartao>
        )}
      </div>

      <div className="space-y-6 lg:col-span-3">
        <section aria-labelledby="titulo-acesso">
          <h2 id="titulo-acesso" className="mb-3 text-xl font-semibold">
            Quem tem acesso
          </h2>
          {!vinculos?.length ? (
            <Vazio>Nenhum familiar vinculado ainda.</Vazio>
          ) : (
            <ul className="space-y-3">
              {vinculos.map((v) => {
                const perfil = Array.isArray(v.perfis) ? v.perfis[0] : v.perfis;
                return (
                  <li key={v.familia_id}>
                    <Cartao className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {perfil?.nome ?? "Familiar"} {v.parentesco && <span className="font-normal">({v.parentesco})</span>}
                        </p>
                        {v.consentimento_em ? (
                          <Etiqueta tipo="revisado">Consentimento em {formatarData(v.consentimento_em)}</Etiqueta>
                        ) : (
                          <Etiqueta tipo="rascunho">Aguardando consentimento</Etiqueta>
                        )}
                      </div>
                      <form action={removerFamilia.bind(null, id, v.familia_id)}>
                        <button type="submit" className={BOTAO_DISCRETO}>
                          Remover acesso
                        </button>
                      </form>
                    </Cartao>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="titulo-reforco">
          <h2 id="titulo-reforco" className="mb-3 text-xl font-semibold">
            Reforço em casa
          </h2>
          {!reforcos?.length ? (
            <Vazio>Quando a família usar o reforço ou a ajuda com a lição, os pedidos aparecem aqui.</Vazio>
          ) : (
            <ul className="space-y-3">
              {reforcos.map((r) => (
                <li key={r.id}>
                  <Cartao>
                    <div className="flex flex-wrap items-center gap-2">
                      <Etiqueta tipo="casa">{rotuloTipoReforco(r.tipo)}{r.materia ? ` · ${r.materia}` : ""}</Etiqueta>
                      <span className="text-base">{formatarData(r.created_at, true)}</span>
                    </div>
                    <p className="mt-2">
                      <strong>Pedido:</strong> {r.pedido}
                    </p>
                    {r.resposta && (
                      <details className="mt-2">
                        <summary className="cursor-pointer underline underline-offset-4">Ver a orientação da IA</summary>
                        <div className="mt-2">
                          <TextoFormatado texto={r.resposta} />
                        </div>
                      </details>
                    )}
                    {feitaDe.get(r.id) && <AtividadeFeita feita={feitaDe.get(r.id)!} />}
                  </Cartao>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

const ROTULO_COMO_FOI: Record<string, string> = { facil: "😀 Fácil", medio: "🙂 Médio", dificil: "😕 Difícil" };

// O que a crianca respondeu ao fazer a atividade de reforco na plataforma
function AtividadeFeita({
  feita,
}: {
  feita: { respostas: unknown; como_foi: string | null; observacao: string | null; feita_em: string };
}) {
  const respostas = Array.isArray(feita.respostas) ? (feita.respostas as string[]) : [];
  return (
    <div className="mt-3 rounded-xl bg-salvia/15 p-3">
      <p className="font-medium">
        Feita pela criança na plataforma em {formatarData(feita.feita_em)}
        {feita.como_foi ? ` · ${ROTULO_COMO_FOI[feita.como_foi]}` : ""}
      </p>
      {feita.observacao && <p className="mt-1">Família: “{feita.observacao}”</p>}
      {respostas.some((r) => r) && (
        <details className="mt-1">
          <summary className="cursor-pointer underline underline-offset-4">Ver as respostas</summary>
          <ol className="mt-2 list-decimal pl-6">
            {respostas.map((r, i) => (
              <li key={i}>{r || <em>em branco</em>}</li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
