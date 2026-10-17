"use client";

import { useId } from "react";

export type AlunoResumo = { id: string; nome: string; ano_escolar?: string | null };

// Lista de escolha do aluno, usada nas telas de atalho (adaptar, convidar, recado)
export function SeletorAluno({
  alunos,
  valor,
  aoMudar,
  rotulo = "Para qual aluno?",
}: {
  alunos: AlunoResumo[];
  valor: string;
  aoMudar: (id: string) => void;
  rotulo?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {rotulo}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca focus:border-petroleo"
      >
        <option value="">Escolha o aluno</option>
        {alunos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
            {a.ano_escolar ? ` · ${a.ano_escolar}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
