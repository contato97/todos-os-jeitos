import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { buscarPlano, formatarReais, linkWhatsapp, precoDoCiclo, type Ciclo } from "@/lib/planos";

export const metadata: Metadata = { title: "Assinar | Todos os Jeitos" };

// Checkout. A forma de pagamento (Pix e cartao) ainda vai ser escolhida:
// por enquanto mostramos o resumo do pedido e a assinatura e feita pelo WhatsApp.
// Quando a plataforma de pagamento estiver definida, o botao principal passa a
// abrir o pagamento dela. Esta pagina NUNCA pede dados de cartao.
export default function Checkout({ searchParams }: PageProps<"/checkout">) {
  return (
    <>
      <SiteHeader />
      <main className="px-4 py-12">
        <Suspense fallback={<p className="text-center">Carregando...</p>}>
          <Resumo searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function Resumo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const busca = await searchParams;
  const plano = buscarPlano(typeof busca.plano === "string" ? busca.plano : null);
  const ciclo: Ciclo = busca.ciclo === "anual" ? "anual" : "mensal";
  const preco = plano ? precoDoCiclo(plano, ciclo) : null;

  // Plano inexistente, gratis ou sob consulta nao passam pelo checkout
  if (!plano || !preco) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-semibold">Escolha um plano</h1>
        <p className="mt-3">Não encontramos o plano escolhido. Volte aos planos e escolha de novo.</p>
        <Link href="/#planos" className="mt-6 inline-block rounded-full bg-marca px-6 py-3 font-medium text-creme hover:bg-petroleo">
          Ver planos
        </Link>
      </div>
    );
  }

  const outroCiclo: Ciclo = ciclo === "anual" ? "mensal" : "anual";
  const mensagem = `Olá! Quero assinar o plano ${plano.nome} (${ciclo}, ${formatarReais(preco)}) da Todos os Jeitos.`;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-labelledby="titulo-checkout" className="min-w-0">
        <Link href="/#planos" className="underline underline-offset-4">
          ← Voltar aos planos
        </Link>
        <h1 id="titulo-checkout" className="mt-4 text-3xl font-semibold">
          Assinar o plano {plano.nome}
        </h1>
        <p className="mt-2">{plano.resumo}</p>

        <div className="mt-6 rounded-2xl bg-white/80 p-6 ring-1 ring-marca/10">
          <h2 className="text-lg font-semibold">O que está incluído</h2>
          <ul className="mt-3 space-y-2">
            {plano.itens.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="font-semibold text-petroleo">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border-l-4 border-mostarda bg-mostarda/15 p-5">
          <h2 className="font-semibold">Pagamento online chegando</h2>
          <p className="mt-1">
            Em breve você vai poder pagar aqui mesmo, por Pix ou cartão. Enquanto isso, a assinatura é feita com a nossa
            equipe pelo WhatsApp, de forma rápida e segura.
          </p>
        </div>
      </section>

      <aside aria-labelledby="titulo-resumo" className="h-fit rounded-2xl bg-white/80 p-6 ring-2 ring-petroleo">
        <h2 id="titulo-resumo" className="text-lg font-semibold">
          Resumo do pedido
        </h2>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between gap-4">
            <dt>Plano</dt>
            <dd className="font-medium">{plano.nome}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Pagamento</dt>
            <dd className="font-medium">{ciclo === "anual" ? "Anual" : "Mensal"}</dd>
          </div>
          {ciclo === "anual" && plano.precoMensal && (
            <div className="flex justify-between gap-4 text-base">
              <dt>Economia</dt>
              <dd>{formatarReais(plano.precoMensal * 12 - preco)} (2 meses grátis)</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-marca/10 pt-3 text-xl">
            <dt className="font-semibold">Total</dt>
            <dd className="font-semibold">
              {formatarReais(preco)}
              <span className="text-base font-normal">/{ciclo === "anual" ? "ano" : "mês"}</span>
            </dd>
          </div>
        </dl>

        <a
          href={linkWhatsapp(mensagem)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block rounded-full bg-marca px-5 py-3 text-center font-medium text-creme hover:bg-petroleo"
        >
          Assinar pelo WhatsApp
        </a>
        <Link
          href={`/checkout?plano=${plano.id}&ciclo=${outroCiclo}`}
          className="mt-3 block text-center underline underline-offset-4"
        >
          {outroCiclo === "anual" ? "Prefiro o anual (2 meses grátis)" : "Prefiro pagar por mês"}
        </Link>
        <p className="mt-4 text-base">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-medium underline underline-offset-4">
            Comece grátis
          </Link>{" "}
          e assine quando quiser.
        </p>
      </aside>
    </div>
  );
}
