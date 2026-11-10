"use client";

import Link from "next/link";
import { useState } from "react";
import { MESES_PAGOS_NO_ANUAL, PLANOS, formatarReais, linkWhatsapp, precoDoCiclo, type Ciclo } from "@/lib/planos";

// "use client": a troca entre mensal e anual acontece no navegador, sem recarregar
export function TabelaPlanos() {
  const [ciclo, setCiclo] = useState<Ciclo>("mensal");

  return (
    <>
      <div role="radiogroup" aria-label="Forma de pagamento" className="mx-auto flex w-fit gap-1 rounded-full bg-white/80 p-1 ring-1 ring-marca/10">
        {(["mensal", "anual"] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={ciclo === c}
            onClick={() => setCiclo(c)}
            className={`rounded-full px-5 py-2 font-medium ${ciclo === c ? "bg-marca text-creme" : "hover:bg-marca/5"}`}
          >
            {c === "mensal" ? "Mensal" : "Anual · 2 meses grátis"}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        {PLANOS.map((p) => {
          const preco = precoDoCiclo(p, ciclo);
          return (
            <li
              key={p.id}
              className={`flex flex-col rounded-2xl bg-white/80 p-6 ring-1 ${
                p.destaque ? "ring-2 ring-petroleo" : "ring-marca/10"
              }`}
            >
              {p.destaque && (
                <span className="mb-3 w-fit rounded-full bg-petroleo/15 px-3 py-1 text-base font-medium">Mais escolhido</span>
              )}
              <p className="text-base font-medium">{p.publico}</p>
              <h2 className="text-2xl font-semibold">{p.nome}</h2>
              <p className="mt-1 text-base">{p.resumo}</p>

              <div className="mt-5 min-h-20">
                {p.sobConsulta ? (
                  <p className="text-2xl font-semibold">Sob consulta</p>
                ) : preco === 0 ? (
                  <p className="text-3xl font-semibold">Grátis</p>
                ) : (
                  <>
                    <p>
                      <span className="text-3xl font-semibold">{formatarReais(preco!)}</span>
                      <span className="text-base"> /{ciclo === "anual" ? "ano" : "mês"}</span>
                    </p>
                    {ciclo === "anual" && (
                      <p className="text-base">equivale a {formatarReais(preco! / 12)} por mês</p>
                    )}
                  </>
                )}
              </div>

              <ul className="mt-4 flex-1 space-y-2">
                {p.itens.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="font-semibold text-petroleo">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {p.sobConsulta ? (
                  <a
                    href={linkWhatsapp("Olá! Quero conhecer o plano Escola da Todos os Jeitos.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-full bg-marca px-5 py-3 text-center font-medium text-creme hover:bg-petroleo"
                  >
                    Falar com um especialista
                  </a>
                ) : preco === 0 ? (
                  <Link href="/cadastro" className="block rounded-full px-5 py-3 text-center font-medium ring-2 ring-marca">
                    Começar grátis
                  </Link>
                ) : (
                  <Link
                    href={`/checkout?plano=${p.id}&ciclo=${ciclo}`}
                    className={`block rounded-full px-5 py-3 text-center font-medium ${
                      p.destaque ? "bg-marca text-creme hover:bg-petroleo" : "ring-2 ring-marca"
                    }`}
                  >
                    Assinar {p.nome}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mx-auto mt-8 max-w-3xl text-center text-base">
        1 crédito = até 2 páginas. Adaptar uma folha usa 1 crédito; uma prova de 6 páginas usa 3. Os créditos renovam todo
        mês. No anual você paga {MESES_PAGOS_NO_ANUAL} meses e usa 12.
      </p>
    </>
  );
}
