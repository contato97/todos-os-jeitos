"use client";

export function BotaoImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-full bg-marca px-5 py-2.5 font-medium text-creme">
      Imprimir / Salvar PDF
    </button>
  );
}
