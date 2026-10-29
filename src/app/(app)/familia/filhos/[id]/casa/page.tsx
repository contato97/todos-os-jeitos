import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Cartao, formatarData } from "@/components/ui";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioComoEmCasa } from "./formulario-como-em-casa";

export default function ComoEmCasa({ params }: PageProps<"/familia/filhos/[id]/casa">) {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.casa} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await buscarUsuario();
  const supabase = await criarClienteServidor();
  const { data: ficha } = await supabase
    .from("aluno_casa")
    .select("como_em_casa, rotina_estudo, medicacoes, acompanhamentos, outras, atualizado_em")
    .eq("aluno_id", id)
    .eq("familia_id", usuario?.id ?? "")
    .maybeSingle();

  const { atualizado_em, ...campos } = ficha ?? {};
  const atuais = Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, (v as string | null) ?? ""]));

  return (
    <Cartao className="mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold">Como é em casa</h2>
      <p className="mt-1 mb-5">
        Você também tem voz: conte como seu filho é fora da escola. Preencha só o que quiser, e atualize sempre que algo mudar.
        {atualizado_em && ` Última atualização: ${formatarData(atualizado_em)}.`}
      </p>
      <FormularioComoEmCasa alunoId={id} atuais={atuais} />
    </Cartao>
  );
}
