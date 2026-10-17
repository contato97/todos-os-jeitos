import Link from "next/link";
import { notFound } from "next/navigation";
import { BarraExportar } from "@/components/barra-exportar";
import { BOTAO_SECUNDARIO, Cartao, Etiqueta } from "@/components/ui";
import { AVISO_DIAGNOSTICO, mencionaDiagnostico } from "@/lib/ia/diagnostico";
import { criarClienteServidor } from "@/lib/supabase/server";
import { EditorAtividade } from "../alunos/[id]/atividades/[atividadeId]/editor-atividade";

// Resultado da adaptacao na propria tela "Adaptar atividade":
// 1. enviou  2. revisa e aprova  3. baixa ou copia
export async function ResultadoAdaptacao({ atividadeId }: { atividadeId: string }) {
  const supabase = await criarClienteServidor();
  const { data: atividade } = await supabase.from("atividades").select("*, alunos(nome)").eq("id", atividadeId).maybeSingle();
  if (!atividade) notFound();
  const aluno = Array.isArray(atividade.alunos) ? atividade.alunos[0] : atividade.alunos;
  const revisada = atividade.status === "revisado";

  const passos = [
    { texto: "Enviar a atividade", feito: true },
    { texto: "Revisar e aprovar", feito: revisada },
    { texto: "Baixar ou copiar", feito: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-wrap gap-2" aria-label="Passos">
        {passos.map((p, i) => {
          const atual = !p.feito && (i === 0 || passos[i - 1].feito);
          return (
            <li
              key={p.texto}
              aria-current={atual ? "step" : undefined}
              className={`rounded-full px-4 py-1.5 ${p.feito ? "bg-salvia/25" : atual ? "bg-marca text-creme" : "bg-marca/5"}`}
            >
              {p.feito ? "✓ " : `${i + 1}. `}
              {p.texto}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Cartao className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">Adaptada para {aluno?.nome}</h2>
            {revisada ? <Etiqueta tipo="revisado">Revisada</Etiqueta> : <Etiqueta tipo="rascunho">Rascunho da IA</Etiqueta>}
          </div>
          {!revisada && (
            <p className="mb-5 rounded-xl bg-mostarda/15 p-4">
              Leia com atenção, ajuste o que precisar em <strong>Editar</strong> e clique em <strong>“Revisei e aprovo”</strong>. Logo
              depois aparecem as opções de copiar e baixar.
            </p>
          )}
          <EditorAtividade
            atividade={atividade}
            avisoInicial={mencionaDiagnostico(atividade.conteudo_adaptado) ? AVISO_DIAGNOSTICO : undefined}
          />
        </Cartao>

        <div className="flex flex-col gap-4">
          <Cartao>
            <h2 className="mb-3 text-lg font-semibold">Baixar ou copiar</h2>
            {revisada ? (
              <BarraExportar atividadeId={atividade.id} titulo={atividade.titulo} texto={atividade.conteudo_adaptado ?? ""} nomeAluno={aluno?.nome} />
            ) : (
              <p>
                Disponível depois da sua revisão: <strong>Copiar</strong>, <strong>Word</strong>, <strong>PDF</strong>,{" "}
                <strong>Imagem</strong> e <strong>Imprimir</strong>.
              </p>
            )}
          </Cartao>
          <Link href={`/professor/adaptar?aluno=${atividade.aluno_id}`} className={BOTAO_SECUNDARIO}>
            Adaptar outra atividade
          </Link>
          <Link href={`/professor/alunos/${atividade.aluno_id}/atividades`} className="text-center underline underline-offset-4">
            Ver todas as atividades de {aluno?.nome?.split(" ")[0]}
          </Link>
        </div>
      </div>
    </div>
  );
}
