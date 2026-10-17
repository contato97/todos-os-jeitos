import Link from "next/link";
import { ComoUsar } from "@/components/area/como-usar";
import { BOTAO, BOTAO_SECUNDARIO, Cartao, Etiqueta, formatarData } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { buscarUsuario } from "@/lib/auth";
import { diasAtras } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/server";

// Painel do professor: numeros da semana, pendencias e o que chegou de casa
export default async function PainelProfessor() {
  const supabase = await criarClienteServidor();
  const usuario = await buscarUsuario();
  const seteDias = diasAtras(7);

  const [{ data: alunos }, { data: observacoes }, { data: atividades }, { data: relatorios }, { count: familias }] =
    await Promise.all([
      supabase.from("alunos").select("id, nome, ano_escolar").order("nome"),
      supabase
        .from("observacoes")
        .select("id, aluno_id, origem, texto, data_observacao, created_at")
        .order("data_observacao", { ascending: false })
        .limit(200),
      supabase.from("atividades").select("id, aluno_id, titulo, status, created_at").order("created_at", { ascending: false }),
      supabase.from("relatorios").select("id, aluno_id, status, periodo_fim").order("created_at", { ascending: false }),
      supabase.from("aluno_familias").select("*", { count: "exact", head: true }),
    ]);

  const nomeAluno = new Map((alunos ?? []).map((a) => [a.id, a.nome]));
  const obs = observacoes ?? [];
  const obsSemana = obs.filter((o) => o.data_observacao >= seteDias);
  const deCasa = obs.filter((o) => o.origem === "casa").slice(0, 4);
  const ultimaObs = new Map<string, string>();
  for (const o of obs) if (!ultimaObs.has(o.aluno_id)) ultimaObs.set(o.aluno_id, o.data_observacao);

  const rascunhosAtiv = (atividades ?? []).filter((a) => a.status === "rascunho");
  const rascunhosRel = (relatorios ?? []).filter((r) => r.status === "rascunho");

  const casaSemana = obs.filter((o) => o.origem === "casa" && o.data_observacao >= seteDias).length;
  const numeros = [
    { rotulo: "Alunos", valor: alunos?.length ?? 0, href: "/professor/alunos", faixa: "bg-petroleo" },
    { rotulo: "Observações (7 dias)", valor: obsSemana.filter((o) => o.origem === "escola").length, href: "/professor/alunos", faixa: "bg-salvia" },
    { rotulo: "Atividades adaptadas", valor: atividades?.length ?? 0, href: "/professor/adaptar", faixa: "bg-lavanda" },
    { rotulo: "Rascunhos para revisar", valor: rascunhosAtiv.length + rascunhosRel.length, href: "#para-revisar", faixa: "bg-mostarda" },
    { rotulo: "Mensagens da família (7 dias)", valor: casaSemana, href: "/professor/familias", faixa: "bg-coral" },
  ];

  const passos = [
    { feito: (alunos?.length ?? 0) > 0, texto: "Cadastrar o primeiro aluno", href: "/professor/alunos/novo" },
    { feito: obs.length > 0, texto: "Registrar uma observação", href: alunos?.[0] ? `/professor/alunos/${alunos[0].id}/observacoes` : null },
    { feito: (atividades?.length ?? 0) > 0, texto: "Adaptar uma atividade com a IA", href: alunos?.length ? "/professor/adaptar" : null },
    { feito: (familias ?? 0) > 0, texto: "Convidar uma família", href: alunos?.length ? "/professor/convidar" : null },
  ];
  const faltam = passos.filter((p) => !p.feito);

  // Alunos sem observacao ha mais de 14 dias merecem um olhar
  const quinzeDias = diasAtras(14);
  const semNoticias = (alunos ?? []).filter((a) => !ultimaObs.has(a.id) || ultimaObs.get(a.id)! < quinzeDias);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Olá, {usuario?.nome?.split(" ")[0]}!</h1>
          <p className="mt-1">Um resumo do acompanhamento dos seus alunos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/professor/adaptar" className={BOTAO}>
            Adaptar atividade
          </Link>
          <Link href="/professor/alunos/novo" className={BOTAO_SECUNDARIO}>
            Novo aluno
          </Link>
        </div>
      </div>

      <ComoUsar secao={AJUDA_PROFESSOR.painel} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {numeros.map((n) => (
          <li key={n.rotulo}>
            <Link href={n.href} className="block h-full overflow-hidden rounded-2xl bg-white/80 ring-1 ring-marca/10 hover:ring-petroleo">
              <span aria-hidden="true" className={`block h-1.5 ${n.faixa}`} />
              <span className="block p-5">
                <span className="block text-3xl font-semibold">{n.valor}</span>
                <span className="mt-1 block">{n.rotulo}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {faltam.length > 0 && (
        <Cartao className="mt-6 border-l-4 border-mostarda">
          <h2 className="text-xl font-semibold">Primeiros passos</h2>
          <ol className="mt-3 space-y-2">
            {passos.map((p) => (
              <li key={p.texto} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-base ${
                    p.feito ? "bg-salvia text-white" : "ring-2 ring-marca/30"
                  }`}
                >
                  {p.feito ? "✓" : ""}
                </span>
                {p.feito || !p.href ? (
                  <span className={p.feito ? "line-through opacity-70" : ""}>
                    {p.texto}
                    <span className="sr-only">{p.feito ? " (feito)" : " (pendente)"}</span>
                  </span>
                ) : (
                  <Link href={p.href} className="underline underline-offset-4">
                    {p.texto}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </Cartao>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Cartao>
          <h2 id="para-revisar" className="scroll-mt-24 text-xl font-semibold">Para revisar</h2>
          {rascunhosAtiv.length + rascunhosRel.length === 0 ? (
            <p className="mt-2">Nenhum rascunho esperando revisão.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {rascunhosAtiv.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link href={`/professor/alunos/${a.aluno_id}/atividades/${a.id}`} className="underline underline-offset-4">
                    {a.titulo}
                  </Link>{" "}
                  <span className="text-base">· atividade de {nomeAluno.get(a.aluno_id)}</span>
                </li>
              ))}
              {rascunhosRel.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Link href={`/professor/alunos/${r.aluno_id}/relatorios/${r.id}`} className="underline underline-offset-4">
                    Relatório de {nomeAluno.get(r.aluno_id)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Comunicação com a família</h2>
            <Link href="/professor/familias" className="underline underline-offset-4">
              Ver tudo
            </Link>
          </div>
          {deCasa.length === 0 ? (
            <p className="mt-2">As observações que as famílias enviarem aparecem aqui.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {deCasa.map((o) => (
                <li key={o.id}>
                  <p className="text-base">
                    <strong>{nomeAluno.get(o.aluno_id)}</strong> · {formatarData(o.data_observacao)}
                  </p>
                  <p className="line-clamp-2">{o.texto}</p>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </div>

      <Cartao className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Meus alunos</h2>
          <Link href="/professor/alunos" className="underline underline-offset-4">
            Ver todos
          </Link>
        </div>
        {!alunos?.length ? (
          <p className="mt-2">Nenhum aluno ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-marca/10">
            {alunos.slice(0, 8).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link href={`/professor/alunos/${a.id}`} className="font-medium underline-offset-4 hover:underline">
                  {a.nome}
                </Link>
                <span className="flex items-center gap-2 text-base">
                  {ultimaObs.has(a.id) ? `Última observação: ${formatarData(ultimaObs.get(a.id)!)}` : "Sem observações"}
                  {semNoticias.some((s) => s.id === a.id) && <Etiqueta tipo="rascunho">Registrar algo</Etiqueta>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </>
  );
}
