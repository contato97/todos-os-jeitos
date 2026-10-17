import type { SecaoAjuda } from "@/lib/ajuda";

// Ajuda da tela. Comeca FECHADA para nao poluir a tela: abre so quando a pessoa clica.
// <details>/<summary> e um recurso nativo do HTML: funciona no teclado e no
// leitor de tela, sem precisar de JavaScript.
export function ComoUsar({ secao }: { secao: SecaoAjuda }) {
  return (
    <details className="group mb-8 rounded-2xl bg-white/60 ring-1 ring-marca/10">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-4 font-medium">
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-petroleo text-base text-creme"
        >
          ?
        </span>
        Como usar esta tela
        <span aria-hidden="true" className="ml-auto group-open:rotate-180">
          ▾
        </span>
      </summary>
      <ListaPerguntas secao={secao} />
    </details>
  );
}

export function ListaPerguntas({ secao }: { secao: SecaoAjuda }) {
  return (
    <dl className="space-y-4 px-5 pb-5">
      {secao.perguntas.map((p) => (
        <div key={p.pergunta}>
          <dt className="font-semibold">{p.pergunta}</dt>
          <dd className="mt-1">{p.resposta}</dd>
        </div>
      ))}
    </dl>
  );
}

// Pagina "Ajuda" de cada area: todas as secoes reunidas
export function PaginaAjuda({ secoes }: { secoes: SecaoAjuda[] }) {
  return (
    <>
      <h1 className="text-3xl font-semibold">Ajuda</h1>
      <p className="mt-2">
        Dúvidas sobre como usar a plataforma. Não encontrou o que procurava?{" "}
        <a href="https://wa.me/5511971261699" className="underline underline-offset-4">
          Fale com a gente no WhatsApp
        </a>
        .
      </p>
      <div className="mt-8 space-y-6">
        {secoes.map((secao) => (
          <section key={secao.titulo} className="rounded-2xl bg-white/60 pt-5 ring-1 ring-marca/10">
            <h2 className="px-5 pb-3 text-xl font-semibold">{secao.titulo}</h2>
            <ListaPerguntas secao={secao} />
          </section>
        ))}
      </div>
    </>
  );
}
