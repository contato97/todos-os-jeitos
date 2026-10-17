"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBookOpen,
  FaChartPie,
  FaChildReaching,
  FaChalkboardUser,
  FaCircleQuestion,
  FaComments,
  FaEnvelopeOpenText,
  FaUserGear,
  FaUsers,
  FaWandMagicSparkles,
} from "react-icons/fa6";

// Os icones ficam aqui (no navegador): o servidor manda so o nome de cada um
const ICONES = {
  painel: FaChartPie,
  alunos: FaUsers,
  adaptar: FaWandMagicSparkles,
  familias: FaComments,
  convidar: FaEnvelopeOpenText,
  ajuda: FaCircleQuestion,
  conta: FaUserGear,
  professores: FaChalkboardUser,
  filhos: FaChildReaching,
  historico: FaBookOpen,
};

export type ItemMenu = { href: string; rotulo: string; icone: keyof typeof ICONES; exato?: boolean; destaque?: boolean };

// Menu lateral das areas logadas. No computador fica fixo a esquerda;
// no celular vira uma faixa rolavel acima do conteudo.
export function MenuLateral({ grupos, rotulo }: { grupos: ItemMenu[][]; rotulo: string }) {
  const caminho = usePathname();
  const ativo = (item: ItemMenu) => (item.exato ? caminho === item.href : caminho === item.href || caminho.startsWith(`${item.href}/`));

  return (
    <nav aria-label={rotulo} className="lg:sticky lg:top-6">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {grupos.map((grupo, g) => (
          <li key={g} className={`contents ${g > 0 ? "lg:mt-4 lg:block lg:border-t lg:border-marca/10 lg:pt-4" : "lg:block"}`}>
            <ul className="contents lg:flex lg:flex-col lg:gap-1">
              {grupo.map((item) => {
                const atual = ativo(item);
                const Icone = ICONES[item.icone];
                return (
                  <li key={item.href} className="shrink-0">
                    <Link
                      href={item.href}
                      aria-current={atual ? "page" : undefined}
                      className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 leading-snug lg:whitespace-normal ${
                        atual
                          ? "bg-marca font-semibold text-creme"
                          : item.destaque
                            ? "bg-petroleo/10 font-medium hover:bg-petroleo/15"
                            : "hover:bg-marca/5"
                      }`}
                    >
                      <Icone aria-hidden="true" className="size-5 shrink-0" />
                      {item.rotulo}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
