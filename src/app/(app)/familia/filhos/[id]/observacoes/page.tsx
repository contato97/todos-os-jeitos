import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { BOTAO_DISCRETO, Cartao, Vazio, formatarData } from "@/components/ui";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { buscarUsuario } from "@/lib/auth";
import { hoje } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/server";
import { apagarObservacaoCasa } from "../../../acoes";
import { FormularioCasa } from "./formulario-casa";

export default function ObservacoesFamilia({ params }: PageProps<"/familia/filhos/[id]/observacoes">) {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.observacoes} />
      <Suspense fallback={<Carregando />}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const usuario = await buscarUsuario();
  const { data: minhas } = await supabase
    .from("observacoes")
    .select("id, texto, data_observacao")
    .eq("aluno_id", id)
    .eq("origem", "casa")
    .eq("autor_id", usuario?.id ?? "")
    .order("data_observacao", { ascending: false });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Cartao className="h-fit lg:col-span-2">
        <h2 className="mb-4 text-xl font-semibold">Contar como foi em casa</h2>
        <FormularioCasa alunoId={id} hoje={hoje()} />
      </Cartao>
      <section className="lg:col-span-3" aria-labelledby="titulo-minhas">
        <h2 id="titulo-minhas" className="mb-4 text-xl font-semibold">O que você já contou</h2>
        {!minhas?.length ? (
          <Vazio>Suas observações aparecem aqui.</Vazio>
        ) : (
          <ul className="space-y-3">
            {minhas.map((o) => (
              <li key={o.id}>
                <Cartao>
                  <p className="font-medium">{formatarData(o.data_observacao)}</p>
                  <p className="mt-1 whitespace-pre-line">{o.texto}</p>
                  <form action={apagarObservacaoCasa.bind(null, o.id)} className="mt-2">
                    <button type="submit" className={BOTAO_DISCRETO}>Apagar</button>
                  </form>
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
