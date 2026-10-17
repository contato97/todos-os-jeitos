import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Navegacao } from "@/components/area/navegacao";
import { criarClienteServidor } from "@/lib/supabase/server";

export default function LayoutFilho({ children, params }: LayoutProps<"/familia/filhos/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <CabecalhoFilho params={params} />
      <div className="mt-8">{children}</div>
    </Suspense>
  );
}

async function CabecalhoFilho({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  // So aparece se for filho desta familia e o consentimento ja tiver sido dado (RLS)
  const { data: aluno } = await supabase.from("alunos").select("nome").eq("id", id).maybeSingle();
  if (!aluno) notFound();

  const base = `/familia/filhos/${id}`;
  return (
    <>
      <Link href="/familia" className="underline underline-offset-4">
        ← Meus filhos
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{aluno.nome}</h1>
      <div className="mt-6">
        <Navegacao
          rotulo={`Seções de ${aluno.nome}`}
          itens={[
            { href: base, rotulo: "Histórico", exato: true },
            { href: `${base}/observacoes`, rotulo: "Observações" },
            { href: `${base}/reforco`, rotulo: "Reforço e lição de casa" },
          ]}
        />
      </div>
    </>
  );
}
