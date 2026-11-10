"use client";

import { useActionState } from "react";
import ReactMarkdown from "react-markdown";
import { AreaTexto, Aviso, BotaoEnviar } from "@/components/formulario";
import type { BlocoMaterial } from "@/lib/atividade-texto";
import { salvarRealizacao } from "../../../../../acoes";

const COMO_FOI = [
  { valor: "facil", rotulo: "Fácil", emoji: "😀" },
  { valor: "medio", rotulo: "Médio", emoji: "🙂" },
  { valor: "dificil", rotulo: "Difícil", emoji: "😕" },
] as const;

// Modo crianca: letra grande, so a atividade. Cada "______" vira um campo.
// No fim, o adulto conta como foi.
export function FazerAtividade({
  reforcoId,
  alunoId,
  blocos,
  respostasIniciais,
  comoFoiInicial,
  observacaoInicial,
}: {
  reforcoId: string;
  alunoId: string;
  blocos: BlocoMaterial[];
  respostasIniciais: string[];
  comoFoiInicial: string | null;
  observacaoInicial: string | null;
}) {
  const [estado, acao] = useActionState(salvarRealizacao.bind(null, reforcoId, alunoId), {});
  let indice = 0;

  return (
    <form action={acao} className="flex flex-col gap-8">
      <div className="texto-formatado space-y-4 text-xl leading-relaxed sm:text-2xl">
        {blocos.map((b, i) =>
          b.tipo === "texto" ? (
            <ReactMarkdown key={i}>{b.md}</ReactMarkdown>
          ) : (
            <p key={i} className="flex flex-wrap items-center gap-x-2 gap-y-3">
              {b.partes.map((parte, j) => {
                const campo = j < b.partes.length - 1 ? indice++ : null;
                return (
                  <span key={j} className="contents">
                    {parte.trim() && <span>{parte.trim()}</span>}
                    {campo !== null && (
                      <input
                        name="resposta"
                        aria-label={`Resposta ${campo + 1}`}
                        defaultValue={respostasIniciais[campo] ?? ""}
                        autoComplete="off"
                        className="min-w-24 flex-1 rounded-xl border-2 border-petroleo/40 bg-white px-3 py-2 text-xl text-marca focus:border-petroleo sm:max-w-sm sm:text-2xl"
                      />
                    )}
                  </span>
                );
              })}
            </p>
          ),
        )}
      </div>

      <fieldset className="rounded-2xl bg-creme p-5">
        <legend className="px-1 text-lg font-semibold">Para o adulto: como foi?</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {COMO_FOI.map((c) => (
            <label
              key={c.valor}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-marca/15 bg-white px-4 py-3 has-checked:border-petroleo has-checked:bg-petroleo/10"
            >
              <input
                type="radio"
                name="como_foi"
                value={c.valor}
                required
                defaultChecked={comoFoiInicial === c.valor}
                className="size-5 accent-petroleo"
              />
              <span aria-hidden="true" className="text-2xl">
                {c.emoji}
              </span>
              {c.rotulo}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <AreaTexto
            rotulo="Observação (opcional)"
            name="observacao"
            rows={2}
            maxLength={2000}
            defaultValue={observacaoInicial ?? ""}
            dica="Ex.: precisou de ajuda na 3; contou nos dedos; ficou animado com os dinossauros."
          />
        </div>
      </fieldset>

      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <div>
        <BotaoEnviar enviando="Guardando...">Terminei! Guardar atividade</BotaoEnviar>
      </div>
    </form>
  );
}
