"use client";

import { useId, useState } from "react";
import ReactMarkdown from "react-markdown";

// Campo de texto longo com duas abas: Editar (texto com marcacoes) e Visualizar
// (como vai ficar no PDF / para a familia). As marcacoes sao Markdown simples:
// "# Titulo", "- item", "**negrito**".
export function EditorTexto({
  rotulo,
  name,
  valorInicial,
  linhas = 18,
}: {
  rotulo: string;
  name: string;
  valorInicial: string;
  linhas?: number;
}) {
  const [texto, setTexto] = useState(valorInicial);
  const [aba, setAba] = useState<"editar" | "ver">("ver");
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="font-medium">
          {rotulo}
        </label>
        <div role="group" aria-label={`Modo de ${rotulo}`} className="flex rounded-full bg-marca/5 p-1">
          {(["ver", "editar"] as const).map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={aba === a}
              onClick={() => setAba(a)}
              className={`rounded-full px-4 py-1 text-base ${aba === a ? "bg-white font-semibold shadow-sm" : ""}`}
            >
              {a === "ver" ? "Visualizar" : "Editar"}
            </button>
          ))}
        </div>
      </div>
      {/* O textarea fica sempre no formulario (so escondido no modo Visualizar) para ser enviado */}
      <textarea
        id={id}
        name={name}
        rows={linhas}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        hidden={aba !== "editar"}
        className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 font-mono text-base text-marca focus:border-petroleo"
      />
      {aba === "ver" && (
        <div className="texto-formatado rounded-xl bg-white p-5 ring-1 ring-marca/10">
          <ReactMarkdown>{texto}</ReactMarkdown>
        </div>
      )}
      {aba === "editar" && (
        <p className="text-base">Dica: “# ” cria um título, “- ” cria um item de lista e **texto** fica em negrito.</p>
      )}
    </div>
  );
}
