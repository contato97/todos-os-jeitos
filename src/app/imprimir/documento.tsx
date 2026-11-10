import Image from "next/image";
import { TextoFormatado, formatarData } from "@/components/ui";
import { BotaoImprimir } from "./botao-imprimir";

// Folha pronta para imprimir ou "Salvar como PDF" pelo navegador.
// Com logoEscola, o logo da escola aparece no topo, ao lado do da Todos os Jeitos.
export function Documento({
  titulo,
  subtitulo,
  texto,
  rodape,
  logoEscola,
  escola,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  texto?: string;
  rodape?: string;
  logoEscola?: string | null;
  escola?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <main className="sempre-claro mx-auto w-full max-w-3xl bg-white px-8 py-10 print:max-w-none print:px-0 print:py-0">
      <div className="nao-imprimir mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-creme p-4">
        <p>
          Para salvar em PDF: clique em <strong>Imprimir</strong> e escolha <strong>“Salvar como PDF”</strong>.
        </p>
        <BotaoImprimir />
      </div>
      <header className="mb-8 border-b border-marca/20 pb-4">
        <div className="flex items-center justify-between gap-4">
          {logoEscola ? (
            // eslint-disable-next-line @next/next/no-img-element -- logo enviado pela escola (bucket publico)
            <img src={logoEscola} alt={escola ? `Logo de ${escola}` : "Logo da escola"} className="h-14 w-auto max-w-[45%] object-contain" />
          ) : (
            escola && <p className="font-semibold">{escola}</p>
          )}
          <Image src="/logo.png" alt="Todos os Jeitos" width={1082} height={380} className="ml-auto h-12 w-auto" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{titulo}</h1>
        {subtitulo && <p className="mt-1">{subtitulo}</p>}
        {logoEscola && escola && <p className="mt-1 text-base">{escola}</p>}
      </header>
      {texto !== undefined && <TextoFormatado texto={texto} />}
      {children}
      <footer className="mt-12 border-t border-marca/20 pt-4 text-sm">
        {rodape ?? "Documento revisado pelo professor."} Gerado em {formatarData(new Date())} pela plataforma Todos os Jeitos.
      </footer>
    </main>
  );
}
