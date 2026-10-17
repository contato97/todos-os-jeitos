"use client";

import { useActionState, useState } from "react";
import { AreaTexto, Aviso, BotaoEnviar } from "@/components/formulario";
import { SeletorAluno, type AlunoResumo } from "@/components/area/seletor-aluno";
import { registrarObservacao } from "../acoes";

// Recado para a familia = observacao da escola ja marcada como compartilhada
export function RecadoFamilia({ alunos }: { alunos: AlunoResumo[] }) {
  const [alunoId, setAlunoId] = useState(alunos.length === 1 ? alunos[0].id : "");
  return (
    <div className="flex flex-col gap-4">
      <SeletorAluno alunos={alunos} valor={alunoId} aoMudar={setAlunoId} rotulo="Para a família de qual aluno?" />
      {alunoId && <FormularioRecado key={alunoId} alunoId={alunoId} />}
    </div>
  );
}

function FormularioRecado({ alunoId }: { alunoId: string }) {
  const [estado, acao] = useActionState(registrarObservacao.bind(null, alunoId), {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="visivel_familia" value="on" />
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">Recado enviado. A família vê no histórico do filho.</Aviso>}
      <AreaTexto
        rotulo="Recado"
        name="texto"
        required
        rows={3}
        defaultValue={estado.valores?.texto}
        dica="Ex.: hoje ele leu a frase inteira sozinho! Vale elogiar em casa."
      />
      <div>
        <BotaoEnviar enviando="Enviando...">Enviar para a família</BotaoEnviar>
      </div>
    </form>
  );
}
