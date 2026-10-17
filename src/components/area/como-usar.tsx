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
// "Comunicação com a família" -> "comunicacao-com-a-familia" (endereco da secao na pagina)
function ancora(titulo: string) {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

const WHATSAPP_SUPORTE = `https://wa.me/5511971261699?text=${encodeURIComponent("Olá! Preciso de ajuda com a plataforma Todos os Jeitos.")}`;

// Central de ajuda de cada area: indice de assuntos, perguntas e o suporte no final
export function PaginaAjuda({ secoes }: { secoes: SecaoAjuda[] }) {
  return (
    <>
      <h1 className="text-3xl font-semibold">Central de ajuda</h1>
      <p className="mt-2 max-w-2xl">Respostas rápidas sobre como usar a plataforma. Escolha um assunto:</p>

      <nav aria-label="Assuntos da ajuda" className="mt-5">
        <ul className="flex flex-wrap gap-2">
          {secoes.map((secao) => (
            <li key={secao.titulo}>
              <a
                href={`#${ancora(secao.titulo)}`}
                className="block rounded-full bg-white/80 px-4 py-2 ring-1 ring-marca/10 hover:ring-petroleo"
              >
                {secao.titulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-6">
        {secoes.map((secao) => (
          <section
            key={secao.titulo}
            id={ancora(secao.titulo)}
            aria-labelledby={`${ancora(secao.titulo)}-titulo`}
            className="scroll-mt-24 rounded-2xl bg-white/60 pt-5 ring-1 ring-marca/10"
          >
            <h2 id={`${ancora(secao.titulo)}-titulo`} className="px-5 pb-3 text-xl font-semibold">
              {secao.titulo}
            </h2>
            <ListaPerguntas secao={secao} />
          </section>
        ))}
      </div>

      <section aria-labelledby="titulo-suporte" className="mt-10 rounded-3xl bg-marca p-8 text-center text-creme">
        <h2 id="titulo-suporte" className="text-2xl font-semibold">
          Ainda está com dúvida?
        </h2>
        <p className="mx-auto mt-2 max-w-xl">Fale com nosso suporte. A gente responde com calma e explica do seu jeito.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={WHATSAPP_SUPORTE}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-creme px-6 py-3 font-medium text-marca hover:bg-white focus-visible:outline-creme"
          >
            Falar no WhatsApp
          </a>
          <a
            href="mailto:contato@todososjeitos.com?subject=Ajuda%20com%20a%20plataforma"
            className="rounded-full px-6 py-3 font-medium ring-2 ring-creme hover:bg-creme/10 focus-visible:outline-creme"
          >
            Enviar e-mail
          </a>
        </div>
      </section>
    </>
  );
}
