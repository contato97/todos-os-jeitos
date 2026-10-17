import Image from "next/image";
import { TextoFormatado, formatarData } from "@/components/ui";
import { BotaoImprimir } from "./botao-imprimir";

// Folha pronta para imprimir ou "Salvar como PDF" pelo navegador
export function Documento({
  titulo,
  subtitulo,
  texto,
  rodape,
}: {
  titulo: string;
  subtitulo?: string;
  texto: string;
  rodape?: string;
}) {
  return (
    <main className="sempre-claro mx-auto w-full max-w-3xl bg-white px-8 py-10 print:max-w-none print:px-0 print:py-0">
      <div className="nao-imprimir mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-creme p-4">
        <p>
          Para salvar em PDF: clique em <strong>Imprimir</strong> e escolha <strong>“Salvar como PDF”</strong>.
        </p>
        <BotaoImprimir />
      </div>
      <header className="mb-8 flex items-center justify-between gap-4 border-b border-marca/20 pb-4">
        <div>
          <h1 className="text-2xl font-semibold">{titulo}</h1>
          {subtitulo && <p className="mt-1">{subtitulo}</p>}
        </div>
        <Image src="/logo.png" alt="Todos os Jeitos" width={1082} height={380} className="h-12 w-auto" />
      </header>
      <TextoFormatado texto={texto} />
      <footer className="mt-12 border-t border-marca/20 pt-4 text-sm">
        {rodape ?? "Documento revisado pelo professor."} Gerado em {formatarData(new Date())} pela plataforma Todos os Jeitos.
      </footer>
    </main>
  );
}
