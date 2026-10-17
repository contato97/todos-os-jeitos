"use client";

import { useEffect, useState } from "react";
import { FaCircleHalfStroke, FaMoon, FaSun } from "react-icons/fa6";

type Tema = "auto" | "claro" | "escuro";

const OPCOES: Record<Tema, { rotulo: string; Icone: typeof FaSun; proximo: Tema }> = {
  auto: { rotulo: "Tema automático", Icone: FaCircleHalfStroke, proximo: "escuro" },
  escuro: { rotulo: "Tema escuro", Icone: FaMoon, proximo: "claro" },
  claro: { rotulo: "Tema claro", Icone: FaSun, proximo: "auto" },
};

export const CHAVE_TEMA = "tdj-tema";

function aplicar(tema: Tema) {
  if (tema === "auto") document.documentElement.removeAttribute("data-tema");
  else document.documentElement.setAttribute("data-tema", tema);
}

// Botao que alterna Automatico -> Escuro -> Claro. A escolha fica salva
// neste navegador (localStorage); "Automatico" segue o celular/computador.
export function BotaoTema() {
  const [tema, setTema] = useState<Tema>("auto");

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_TEMA);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- le a escolha salva so depois de abrir a pagina
      if (salvo === "claro" || salvo === "escuro") setTema(salvo);
    } catch {
      // navegador sem acesso ao armazenamento: fica no automatico
    }
  }, []);

  function trocar() {
    const novo = OPCOES[tema].proximo;
    setTema(novo);
    aplicar(novo);
    try {
      if (novo === "auto") localStorage.removeItem(CHAVE_TEMA);
      else localStorage.setItem(CHAVE_TEMA, novo);
    } catch {}
  }

  const { rotulo, Icone } = OPCOES[tema];
  return (
    <button
      type="button"
      onClick={trocar}
      aria-label={`${rotulo}. Clique para trocar.`}
      title={rotulo}
      className="flex size-11 shrink-0 items-center justify-center rounded-full ring-2 ring-marca/20 hover:bg-marca/5"
    >
      <Icone aria-hidden="true" className="size-5" />
    </button>
  );
}
