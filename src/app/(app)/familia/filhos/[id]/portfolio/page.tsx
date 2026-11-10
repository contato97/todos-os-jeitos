import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Portfolio } from "@/components/area/portfolio";
import { hoje } from "@/lib/datas";

export default function PaginaPortfolio({ params, searchParams }: PageProps<"/familia/filhos/[id]/portfolio">) {
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
  return <Portfolio alunoId={id} ano={ano} base={`/familia/filhos/${id}/portfolio`} familia />;
}
