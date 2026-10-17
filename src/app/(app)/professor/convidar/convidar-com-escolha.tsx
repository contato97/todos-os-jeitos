"use client";

import { useState } from "react";
import { FormularioConvite } from "@/components/area/formulario-convite";
import { SeletorAluno, type AlunoResumo } from "@/components/area/seletor-aluno";
import { convidarFamilia } from "../../acoes-convite";

export function ConvidarComEscolha({ alunos, inicial }: { alunos: AlunoResumo[]; inicial: string }) {
  const [alunoId, setAlunoId] = useState(inicial);
  return (
    <div className="flex flex-col gap-5">
      <SeletorAluno alunos={alunos} valor={alunoId} aoMudar={setAlunoId} rotulo="De qual aluno é a família?" />
      {alunoId && (
        <FormularioConvite key={alunoId} acao={convidarFamilia.bind(null, alunoId)} comParentesco rotuloBotao="Criar convite" />
      )}
    </div>
  );
}
