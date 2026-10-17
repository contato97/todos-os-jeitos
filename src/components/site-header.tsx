"use client";

// "use client": este componente roda no navegador porque o menu do celular
// precisa lembrar se esta aberto ou fechado (useState).
import { BotaoTema } from "./botao-tema";
import { Logo } from "./logo";
import Link from "next/link";
import { useState } from "react";

const secoes = [
  { id: "quem-somos", rotulo: "Quem somos" },
  // "Como funciona" leva ao desafio, que abre a historia: o problema e depois a nossa proposta.
  { id: "desafio", rotulo: "Como funciona" },
  { id: "para-quem", rotulo: "Para quem é" },
];

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);

  return (
    <header className="sticky top-0 z-20 border-b border-marca/10 bg-creme/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="Todos os Jeitos, página inicial" className="shrink-0">
          <Logo prioridade className="h-12 w-auto sm:h-14" />
        </Link>

        {/* Computador: tudo visivel em uma linha */}
        <nav aria-label="Seções da página" className="hidden lg:block">
          <ul className="flex gap-1">
            {secoes.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="whitespace-nowrap rounded-full px-3 py-2 hover:bg-marca/5">
                  {s.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <BotaoTema />
          <Link href="/login" className="rounded-full px-4 py-2 font-medium hover:bg-marca/5">
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="whitespace-nowrap rounded-full bg-marca px-5 py-2 font-medium text-creme hover:bg-petroleo"
          >
            Criar conta
          </Link>
        </div>

        {/* Celular e tablet: botao que abre o menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <BotaoTema />
          <button
          type="button"
          className="rounded-full px-4 py-2 font-medium ring-2 ring-marca"
          aria-expanded={aberto}
          aria-controls="menu-celular"
          onClick={() => setAberto(!aberto)}
        >
          {aberto ? "Fechar" : "Menu"}
        </button>
        </div>
      </div>

      {aberto && (
        <nav id="menu-celular" aria-label="Menu" className="border-t border-marca/10 px-4 pb-6 lg:hidden">
          <ul className="flex flex-col py-2">
            {secoes.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={fechar} className="block rounded-lg px-2 py-3">
                  {s.rotulo}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Link href="/login" className="flex-1 rounded-full px-4 py-3 text-center font-medium ring-2 ring-marca">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="flex-1 rounded-full bg-marca px-4 py-3 text-center font-medium text-creme"
            >
              Criar conta
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
