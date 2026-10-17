"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, CaixaMarcar, Campo } from "@/components/formulario";
import { registrarObservacao } from "../../../acoes";

export function FormularioObservacao({ alunoId, hoje }: { alunoId: string; hoje: string }) {
  const [estado, acao] = useActionState(registrarObservacao.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <AreaTexto
        rotulo="O que você observou?"
        name="texto"
        required
        rows={3}
        defaultValue={estado.valores?.texto}
        dica="Descreva o que aconteceu, do jeito que viu. Frases curtas bastam."
      />
      <div className="grid items-end gap-4 sm:grid-cols-2">
        <Campo rotulo="Data" name="data_observacao" type="date" defaultValue={hoje} max={hoje} />
        <CaixaMarcar rotulo="Compartilhar com a família" name="visivel_familia" />
      </div>
      <div>
        <BotaoEnviar enviando="Registrando...">Registrar observação</BotaoEnviar>
      </div>
    </form>
  );
}
