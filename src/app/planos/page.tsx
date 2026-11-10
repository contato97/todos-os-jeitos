import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { linkWhatsapp } from "@/lib/planos";
import { TabelaPlanos } from "./tabela-planos";

export const metadata: Metadata = {
  title: "Planos | Todos os Jeitos",
  description: "Planos para professores, famílias e escolas. Comece grátis.",
};

const perguntas = [
  {
    pergunta: "Preciso de cartão para começar?",
    resposta: "Não. O plano Semente é grátis e não pede cartão. Você só assina quando quiser mais alunos e créditos.",
  },
  {
    pergunta: "O que é um crédito?",
    resposta:
      "É o que a inteligência artificial usa para adaptar uma atividade. 1 crédito vale até 2 páginas. Relatórios e pedidos de reforço também contam no limite do mês do seu plano.",
  },
  {
    pergunta: "Posso mudar ou cancelar o plano?",
    resposta: "Sim, a qualquer momento. O plano novo vale a partir do próximo ciclo.",
  },
  {
    pergunta: "Como funciona para escolas?",
    resposta:
      "Montamos uma proposta pelo tamanho da escola: número de professores, alunos acompanhados e especialistas. Fale com a gente pelo WhatsApp.",
  },
];

export default function PaginaPlanos() {
  return (
    <>
      <SiteHeader />
      <main className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold sm:text-5xl">Planos para cada jeito de ensinar</h1>
            <p className="mt-4 text-lg">
              Comece grátis e veja a diferença com os seus alunos. Quando precisar de mais, escolha o plano que cabe na sua
              rotina.
            </p>
          </div>

          <div className="mt-10">
            <TabelaPlanos />
          </div>

          <section aria-labelledby="titulo-duvidas" className="mx-auto mt-16 max-w-3xl">
            <h2 id="titulo-duvidas" className="text-2xl font-semibold">
              Dúvidas sobre os planos
            </h2>
            <div className="mt-4 space-y-3">
              {perguntas.map((p) => (
                <details key={p.pergunta} className="rounded-2xl bg-white/80 p-5 ring-1 ring-marca/10">
                  <summary className="cursor-pointer font-medium">{p.pergunta}</summary>
                  <p className="mt-2">{p.resposta}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-center">
              Ainda está com dúvida?{" "}
              <a
                href={linkWhatsapp("Olá! Tenho uma dúvida sobre os planos da Todos os Jeitos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Fale com nosso suporte
              </a>
            </p>
          </section>
        </div>
      </main>
      <footer className="bg-marca px-4 py-8 text-center text-sm text-creme">
        © 2026 Todos os Jeitos. Todos os direitos reservados.
      </footer>
    </>
  );
}
