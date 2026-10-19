"use client";

import { useState } from "react";
import { SeletorAluno, type AlunoResumo } from "@/components/area/seletor-aluno";
import { FormularioNovaAtividade } from "../alunos/[id]/atividades/nova/formulario-nova-atividade";
import { FormularioManual } from "./formulario-manual";

const MODOS = [
  { valor: "ia", rotulo: "Adaptar com a IA" },
  { valor: "manual", rotulo: "Já tenho a atividade adaptada" },
] as const;

export function AdaptarComEscolha({ alunos, inicial }: { alunos: AlunoResumo[]; inicial: string }) {
  const [alunoId, setAlunoId] = useState(inicial);
  const [modo, setModo] = useState<"ia" | "manual">("ia");

  return (
    <div className="flex flex-col gap-6">
      <SeletorAluno alunos={alunos} valor={alunoId} aoMudar={setAlunoId} rotulo="Para qual aluno é a atividade?" />

      <div role="radiogroup" aria-label="Como você quer criar a atividade" className="flex flex-wrap gap-2">
        {MODOS.map((m) => (
          <button
            key={m.valor}
            type="button"
            role="radio"
            aria-checked={modo === m.valor}
            onClick={() => setModo(m.valor)}
            className={`rounded-full px-4 py-2 ${modo === m.valor ? "bg-marca font-semibold text-creme" : "bg-marca/5 hover:bg-marca/10"}`}
          >
            {m.rotulo}
          </button>
        ))}
      </div>

      {!alunoId ? (
        <p className="rounded-xl bg-marca/5 p-4">Escolha o aluno: a IA adapta a atividade pelo perfil dele.</p>
      ) : modo === "ia" ? (
        // key: trocar de aluno recomeca o formulario do zero
        <FormularioNovaAtividade key={alunoId} alunoId={alunoId} retorno="adaptar" />
      ) : (
        <FormularioManual key={alunoId} alunoId={alunoId} />
      )}
    </div>
  );
}
