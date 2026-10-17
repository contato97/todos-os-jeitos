"use client";

import { useState } from "react";
import { SeletorAluno, type AlunoResumo } from "@/components/area/seletor-aluno";
import { FormularioNovaAtividade } from "../alunos/[id]/atividades/nova/formulario-nova-atividade";

export function AdaptarComEscolha({ alunos, inicial }: { alunos: AlunoResumo[]; inicial: string }) {
  const [alunoId, setAlunoId] = useState(inicial);
  return (
    <div className="flex flex-col gap-6">
      <SeletorAluno alunos={alunos} valor={alunoId} aoMudar={setAlunoId} rotulo="Para qual aluno é a atividade?" />
      {alunoId ? (
        // key: trocar de aluno recomeca o formulario do zero
        <FormularioNovaAtividade key={alunoId} alunoId={alunoId} retorno="adaptar" />
      ) : (
        <p className="rounded-xl bg-marca/5 p-4">Escolha o aluno: a IA adapta a atividade pelo perfil dele.</p>
      )}
    </div>
  );
}
