import Link from "next/link";
import ReactMarkdown from "react-markdown";

// Estilos de botao reaproveitados em toda a plataforma
export const BOTAO =
  "inline-flex items-center justify-center gap-2 rounded-full bg-marca px-5 py-2.5 font-medium text-creme hover:bg-petroleo disabled:opacity-70";
export const BOTAO_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-medium ring-2 ring-marca hover:bg-marca/5 disabled:opacity-70";
export const BOTAO_DISCRETO =
  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-base font-medium underline-offset-4 hover:underline";

export function Cartao({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-white/80 p-5 ring-1 ring-marca/10 sm:p-6 ${className}`}>{children}</section>;
}

// Etiqueta curta (status, origem). A cor e so detalhe: o texto sempre diz o que e.
const CORES_ETIQUETA = {
  neutra: "bg-marca/10",
  rascunho: "bg-mostarda/25",
  revisado: "bg-salvia/25",
  casa: "bg-lavanda/25",
  compartilhado: "bg-petroleo/15",
} as const;

export function Etiqueta({ tipo = "neutra", children }: { tipo?: keyof typeof CORES_ETIQUETA; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-sm font-medium ${CORES_ETIQUETA[tipo]}`}>{children}</span>
  );
}

export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: { href: string; texto: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{titulo}</h1>
        {descricao && <p className="mt-1 max-w-2xl">{descricao}</p>}
      </div>
      {acao && (
        <Link href={acao.href} className={BOTAO}>
          {acao.texto}
        </Link>
      )}
    </div>
  );
}

export function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border-2 border-dashed border-marca/20 p-6">{children}</p>;
}

// Textos da IA chegam em Markdown (titulos, listas, negrito)
export function TextoFormatado({ texto }: { texto: string }) {
  return (
    <div className="texto-formatado">
      <ReactMarkdown>{texto}</ReactMarkdown>
    </div>
  );
}

export function formatarData(data: string | Date, comHora = false) {
  const d = typeof data === "string" ? new Date(data.length === 10 ? `${data}T12:00:00` : data) : data;
  return d.toLocaleDateString("pt-BR", comHora ? { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" } : undefined);
}
