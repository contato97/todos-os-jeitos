"use client";

import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { nomeDeArquivo, temDicas, versaoDoAluno } from "@/lib/atividade-texto";

const BOTAO =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-medium ring-2 ring-marca hover:bg-marca/5 disabled:opacity-60";

// Barra de exportacao da atividade revisada: copiar, Word, PDF, imagem e imprimir.
// "Versao do aluno" tira a secao "Dicas para o professor".
export function BarraExportar({
  atividadeId,
  titulo,
  texto,
  nomeAluno,
  versaoInicial = "aluno",
}: {
  atividadeId: string;
  titulo: string;
  texto: string;
  nomeAluno?: string;
  versaoInicial?: "aluno" | "completa";
}) {
  const [versao, setVersao] = useState<"aluno" | "completa">(versaoInicial);
  const [mensagem, setMensagem] = useState("");
  const [gerandoImagem, setGerandoImagem] = useState(false);
  const folha = useRef<HTMLDivElement>(null);
  const conteudo = useRef<HTMLDivElement>(null);
  const comDicas = temDicas(texto);
  const textoEscolhido = versao === "aluno" ? versaoDoAluno(texto) : texto;
  const query = `versao=${versao}`;
  const avisar = (m: string) => {
    setMensagem(m);
    setTimeout(() => setMensagem(""), 4000);
  };

  async function copiar() {
    const html = conteudo.current?.innerHTML ?? "";
    const simples = conteudo.current?.innerText ?? textoEscolhido;
    try {
      // Copia com formatacao (titulos, listas, negrito) para colar no Word/Google Docs
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([simples], { type: "text/plain" }),
        }),
      ]);
    } catch {
      await navigator.clipboard.writeText(simples);
    }
    avisar("Copiado! Cole no Word, Google Docs ou WhatsApp.");
  }

  async function baixarImagem() {
    if (!folha.current) return;
    setGerandoImagem(true);
    try {
      // O navegador pausa o desenho quando a aba fica escondida: se demorar demais, avisamos
      const png = await Promise.race([
        toPng(folha.current, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true }),
        new Promise<never>((_, rejeitar) => setTimeout(() => rejeitar(new Error("demorou")), 20000)),
      ]);
      const link = document.createElement("a");
      link.href = png;
      link.download = `${nomeDeArquivo(titulo)}.png`;
      link.click();
      avisar("Imagem baixada.");
    } catch {
      avisar("Não foi possível gerar a imagem. Tente o PDF.");
    } finally {
      setGerandoImagem(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {comDicas && (
        <div role="radiogroup" aria-label="Qual versão exportar" className="flex flex-wrap gap-2">
          {(
            [
              ["aluno", "Versão do aluno"],
              ["completa", "Com dicas para o professor"],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={versao === valor}
              onClick={() => setVersao(valor)}
              className={`rounded-full px-4 py-1.5 text-base ${versao === valor ? "bg-marca font-semibold text-creme" : "bg-marca/5"}`}
            >
              {rotulo}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={copiar} className={BOTAO}>
          Copiar
        </button>
        <a href={`/exportar/atividade/${atividadeId}?formato=word&${query}`} className={BOTAO}>
          Word
        </a>
        <a href={`/exportar/atividade/${atividadeId}?formato=pdf&${query}`} className={BOTAO}>
          PDF
        </a>
        <button type="button" onClick={baixarImagem} disabled={gerandoImagem} className={BOTAO}>
          {gerandoImagem ? "Gerando..." : "Imagem"}
        </button>
        <a href={`/imprimir/atividade/${atividadeId}?${query}`} target="_blank" className={`${BOTAO} col-span-2`}>
          Imprimir
        </a>
      </div>
      <p role="status" className="min-h-6 text-base">
        {mensagem}
      </p>

      {/* "Folha" fora da tela: e o que vira imagem e o que e copiado com formatacao */}
      <div aria-hidden="true" className="pointer-events-none fixed -left-[10000px] top-0">
        <div ref={folha} className="sempre-claro w-[800px] bg-white p-12 text-[18px] leading-relaxed text-marca">
          <div className="mb-6 flex items-center justify-between border-b border-marca/20 pb-4">
            <span className="text-base">{nomeAluno ? `Aluno(a): ${nomeAluno}` : ""}</span>
            {/* eslint-disable-next-line @next/next/no-img-element -- precisa ser <img> simples para virar imagem */}
            <img src="/logo.png" alt="" className="h-12 w-auto" />
          </div>
          <div ref={conteudo} className="texto-formatado">
            <ReactMarkdown>{textoEscolhido}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
