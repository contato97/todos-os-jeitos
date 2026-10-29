import { ComoUsar } from "@/components/area/como-usar";
import { FormularioConvite } from "@/components/area/formulario-convite";
import { BOTAO_DISCRETO, BOTAO_SECUNDARIO, Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_ESCOLA } from "@/lib/ajuda";
import { agoraIso } from "@/lib/datas";
import { rotuloProfissao } from "@/lib/opcoes-cadastro";
import { cancelarConvite, convidarEspecialista } from "../../acoes-convite";
import {
  alterarPermissaoEspecialista,
  desvincularAlunoEspecialista,
  removerEspecialista,
  vincularAlunoEspecialista,
} from "../acoes";
import { dadosDaEscola } from "../dados";

type DadosEspecialista = {
  profissao: string;
  registro: string | null;
  clinica: string;
  local: string;
  atuacao: string;
  perfis: { nome: string } | { nome: string }[] | null;
};

export default async function EspecialistasEscola() {
  const { supabase, escola } = await dadosDaEscola();
  const [{ data: convites }, { data: vinculos }, { data: acompanhamentos }, { data: alunos }] = await Promise.all([
    supabase
      .from("convites")
      .select("id, email, expira_em")
      .eq("tipo", "especialista")
      .is("usado_em", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("escola_especialistas")
      .select("especialista_id, created_at, especialistas(profissao, registro, clinica, local, atuacao, perfis(nome))")
      .eq("escola_id", escola?.id ?? ""),
    supabase
      .from("especialista_alunos")
      .select("aluno_id, especialista_id, ver_relatorios, pode_registrar")
      .eq("escola_id", escola?.id ?? ""),
    supabase.from("alunos").select("id, nome").order("nome"),
  ]);
  const agora = agoraIso();
  const nomeAluno = new Map((alunos ?? []).map((a) => [a.id, a.nome]));

  const especialistas = (vinculos ?? []).map((v) => {
    const esp = (Array.isArray(v.especialistas) ? v.especialistas[0] : v.especialistas) as DadosEspecialista | null;
    const perfil = Array.isArray(esp?.perfis) ? esp?.perfis[0] : esp?.perfis;
    return {
      id: v.especialista_id as string,
      desde: v.created_at as string,
      nome: perfil?.nome ?? "Especialista",
      dados: esp,
      alunos: (acompanhamentos ?? []).filter((a) => a.especialista_id === v.especialista_id),
    };
  });

  return (
    <>
      <h1 className="text-3xl font-semibold">Especialistas</h1>
      <p className="mt-1">Terapeutas, psicólogos e outros profissionais que acompanham os alunos fora da escola.</p>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_ESCOLA.especialistas} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Cartao>
            <h2 className="text-xl font-semibold">Convidar especialista</h2>
            <p className="mb-4 mt-1">
              O especialista recebe um link e cria a conta com os dados profissionais. Depois, você escolhe quais alunos ele
              acompanha.
            </p>
            {escola ? (
              <FormularioConvite acao={convidarEspecialista.bind(null, escola.id)} rotuloBotao="Criar convite" />
            ) : (
              <p>Escola não encontrada.</p>
            )}
          </Cartao>
          {convites && convites.length > 0 && (
            <Cartao>
              <h2 className="text-lg font-semibold">Convites pendentes</h2>
              <ul className="mt-2 space-y-2">
                {convites.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 break-all">
                      {c.email}{" "}
                      {c.expira_em < agora ? (
                        <Etiqueta tipo="rascunho">Expirado</Etiqueta>
                      ) : (
                        <span className="text-base">até {formatarData(c.expira_em)}</span>
                      )}
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

        <section className="min-w-0 lg:col-span-3" aria-labelledby="titulo-especialistas">
          <h2 id="titulo-especialistas" className="mb-3 text-xl font-semibold">
            Especialistas da escola
          </h2>
          {especialistas.length === 0 ? (
            <Vazio>Nenhum especialista ainda. Quando aceitarem o convite, eles aparecem aqui.</Vazio>
          ) : (
            <ul className="space-y-4">
              {especialistas.map((e) => {
                const disponiveis = (alunos ?? []).filter((a) => !e.alunos.some((v) => v.aluno_id === a.id));
                return (
                  <li key={e.id}>
                    <Cartao>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold">{e.nome}</h3>
                          <p className="text-base">
                            {[rotuloProfissao(e.dados?.profissao), e.dados?.registro].filter(Boolean).join(" · ")}
                          </p>
                          <p className="text-base">
                            {[e.dados?.clinica, e.dados?.local].filter(Boolean).join(" · ")} · desde {formatarData(e.desde)}
                          </p>
                          {e.dados?.atuacao && <p className="mt-1 text-base">Atua com: {e.dados.atuacao}</p>}
                        </div>
                        {escola && (
                          <form action={removerEspecialista.bind(null, escola.id, e.id)}>
                            <button type="submit" className={BOTAO_DISCRETO}>
                              Desvincular da escola
                            </button>
                          </form>
                        )}
                      </div>

                      <h4 className="mt-5 font-semibold">Alunos que acompanha</h4>
                      {e.alunos.length === 0 ? (
                        <p className="mt-1 text-base">Nenhum aluno ainda. Escolha abaixo.</p>
                      ) : (
                        <ul className="mt-2 divide-y divide-marca/10">
                          {e.alunos.map((v) => (
                            <li key={v.aluno_id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                              <span className="font-medium">{nomeAluno.get(v.aluno_id) ?? "Aluno"}</span>
                              <div className="flex flex-wrap gap-2">
                                <form action={alterarPermissaoEspecialista.bind(null, v.aluno_id, e.id, "ver_relatorios", !v.ver_relatorios)}>
                                  <button type="submit" className={BOTAO_DISCRETO} aria-pressed={v.ver_relatorios}>
                                    {v.ver_relatorios ? "✓ Vê relatórios" : "Não vê relatórios"}
                                  </button>
                                </form>
                                <form action={alterarPermissaoEspecialista.bind(null, v.aluno_id, e.id, "pode_registrar", !v.pode_registrar)}>
                                  <button type="submit" className={BOTAO_DISCRETO} aria-pressed={v.pode_registrar}>
                                    {v.pode_registrar ? "✓ Pode registrar" : "Não registra"}
                                  </button>
                                </form>
                                <form action={desvincularAlunoEspecialista.bind(null, v.aluno_id, e.id)}>
                                  <button type="submit" className={BOTAO_DISCRETO}>
                                    Tirar acesso
                                  </button>
                                </form>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {escola && disponiveis.length > 0 && (
                        <form
                          action={vincularAlunoEspecialista.bind(null, escola.id, e.id)}
                          className="mt-4 flex flex-col gap-3 rounded-2xl bg-creme p-4"
                        >
                          <label htmlFor={`aluno-${e.id}`} className="font-medium">
                            Adicionar aluno
                          </label>
                          <select
                            id={`aluno-${e.id}`}
                            name="aluno"
                            required
                            defaultValue=""
                            className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca focus:border-petroleo"
                          >
                            <option value="" disabled>
                              Selecione o aluno
                            </option>
                            {disponiveis.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.nome}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" name="ver_relatorios" defaultChecked className="size-5 accent-petroleo" />
                            Pode ver os relatórios revisados
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" name="pode_registrar" defaultChecked className="size-5 accent-petroleo" />
                            Pode registrar orientações e informações clínicas
                          </label>
                          <div>
                            <button type="submit" className={BOTAO_SECUNDARIO}>
                              Adicionar
                            </button>
                          </div>
                        </form>
                      )}
                    </Cartao>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
