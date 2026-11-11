import Link from "next/link";
import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Portfolio } from "@/components/area/portfolio";
import { hoje } from "@/lib/datas";

// Portfolio do aluno, so leitura (aparecem os relatorios ja revisados pelo professor)
export default function PaginaPortfolio({ params, searchParams }: PageProps<"/escola/alunos/[id]/portfolio">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Conteudo({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const anoLido = Number((await searchParams).ano);
  const ano = anoLido >= 2020 && anoLido <= 2100 ? anoLido : Number(hoje().slice(0, 4));
  return (
    <>
      <Link href={`/escola/alunos/${id}`} className="underline underline-offset-4">
        ← Voltar ao aluno
      </Link>
      <h1 className="mb-6 mt-4 text-3xl font-semibold">Portfólio</h1>
      <Portfolio alunoId={id} ano={ano} base={`/escola/alunos/${id}/portfolio`} />
    </>
  );
}
