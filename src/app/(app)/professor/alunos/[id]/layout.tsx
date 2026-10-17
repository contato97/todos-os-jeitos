import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Navegacao } from "@/components/area/navegacao";
import { criarClienteServidor } from "@/lib/supabase/server";

export default function LayoutAluno({ children, params }: LayoutProps<"/professor/alunos/[id]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <CabecalhoAluno params={params} />
      <div className="mt-8">{children}</div>
    </Suspense>
  );
}

async function CabecalhoAluno({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  // Se o aluno nao for deste professor, o RLS nao devolve nada: mostramos "nao encontrado"
  const { data: aluno } = await supabase.from("alunos").select("nome, ano_escolar").eq("id", id).maybeSingle();
  if (!aluno) notFound();

  const base = `/professor/alunos/${id}`;
  return (
    <>
      <Link href="/professor/alunos" className="underline underline-offset-4">
        ← Meus alunos
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{aluno.nome}</h1>
      {aluno.ano_escolar && <p className="mt-1">{aluno.ano_escolar}</p>}
      <div className="mt-6">
        <Navegacao
          rotulo={`Seções de ${aluno.nome}`}
          itens={[
            { href: base, rotulo: "Perfil vivo", exato: true },
            { href: `${base}/observacoes`, rotulo: "Observações" },
            { href: `${base}/atividades`, rotulo: "Atividades" },
            { href: `${base}/relatorios`, rotulo: "Relatórios" },
            { href: `${base}/familia`, rotulo: "Família" },
          ]}
        />
      </div>
    </>
  );
}
