import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Aviso } from "@/components/formulario";
import { Cartao, formatarData } from "@/components/ui";
import { blocosDoMaterial, materialDaCrianca, quantidadeDeRespostas } from "@/lib/atividade-texto";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FazerAtividade } from "./fazer-atividade";

// A crianca faz a atividade do reforco na tela, com um adulto por perto
export default function FazerReforco({ params }: PageProps<"/familia/filhos/[id]/reforco/[reforcoId]/fazer">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string; reforcoId: string }> }) {
  const { id, reforcoId } = await params;
  const supabase = await criarClienteServidor();
  const [{ data: reforco }, { data: feita }, { data: aluno }] = await Promise.all([
    supabase.from("reforcos").select("id, tema, resposta").eq("id", reforcoId).eq("aluno_id", id).maybeSingle(),
    supabase.from("reforco_realizacoes").select("respostas, como_foi, observacao, feita_em").eq("reforco_id", reforcoId).maybeSingle(),
    supabase.from("alunos").select("nome").eq("id", id).maybeSingle(),
  ]);
  if (!reforco?.resposta) notFound();
  const material = materialDaCrianca(reforco.resposta);
  const voltar = (
    <Link href={`/familia/filhos/${id}/reforco`} className="underline underline-offset-4">
      ← Reforço e lição de casa
    </Link>
  );

  if (!material) {
    return (
      <>
        {voltar}
        <div className="mt-4">
          <Aviso tipo="erro">Este pedido não tem um material para a criança fazer na tela.</Aviso>
        </div>
      </>
    );
  }

  const blocos = blocosDoMaterial(material);
  const nome = aluno?.nome?.split(" ")[0] ?? "";

  return (
    <>
      {voltar}
      <Cartao className="mx-auto mt-4 max-w-3xl">
        <p className="text-lg">
          {nome ? `Vamos lá, ${nome}!` : "Vamos lá!"}{" "}
          {quantidadeDeRespostas(blocos) > 0 ? "Escreva as respostas nos espaços." : "Faça a atividade com o adulto."}
        </p>
        {feita && (
          <p className="mt-2 rounded-xl bg-salvia/15 p-3 text-base">
            Feita em {formatarData(feita.feita_em)}. Você pode mudar as respostas e guardar de novo.
          </p>
        )}
        <div className="mt-6">
          <FazerAtividade
            reforcoId={reforco.id}
            alunoId={id}
            blocos={blocos}
            respostasIniciais={(feita?.respostas as string[] | null) ?? []}
            comoFoiInicial={feita?.como_foi ?? null}
            observacaoInicial={feita?.observacao ?? null}
          />
        </div>
      </Cartao>
    </>
  );
}
