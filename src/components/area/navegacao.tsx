"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ItemNavegacao = { href: string; rotulo: string; exato?: boolean };

// Menu de abas usado nas areas logadas. Marca a aba atual com aria-current,
// que o leitor de tela anuncia como "pagina atual".
export function Navegacao({ itens, rotulo }: { itens: ItemNavegacao[]; rotulo: string }) {
  const caminho = usePathname();

  return (
    <nav aria-label={rotulo} className="overflow-x-auto">
      <ul className="flex gap-1 border-b border-marca/10">
        {itens.map((item) => {
          const atual = item.exato ? caminho === item.href : caminho.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={atual ? "page" : undefined}
                className={`-mb-px block whitespace-nowrap border-b-4 px-4 py-3 ${
                  atual ? "border-petroleo font-semibold" : "border-transparent hover:border-marca/20"
                }`}
              >
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
