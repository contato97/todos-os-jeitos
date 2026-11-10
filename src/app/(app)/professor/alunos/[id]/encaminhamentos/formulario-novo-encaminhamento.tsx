"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { gerarEncaminhamento } from "../../../acoes";

export function FormularioNovoEncaminhamento({ alunoId, inicio }: { alunoId: string; inicio: string }) {
  const [estado, acao, enviando] = useActionState(gerarEncaminhamento.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <AreaTexto
        rotulo="Por que você quer encaminhar?"
        name="motivo"
        required
        rows={4}
        maxLength={2000}
        defaultValue={estado.valores?.motivo}
        dica="Conte o que mais preocupa, com exemplos. Ex.: troca letras parecidas na escrita, tem dificuldade para pronunciar alguns sons e se cansa rápido em atividades de leitura."
      />
      <Campo
        rotulo="Usar as observações desde"
        name="inicio"
        type="date"
        defaultValue={estado.valores?.inicio ?? inicio}
        dica="A IA lê as observações a partir desta data."
      />
      <div>
        <BotaoEnviar enviando="A IA está escrevendo...">Gerar encaminhamento com a IA</BotaoEnviar>
      </div>
      {enviando && (
        <p role="status" className="text-base">
          Isso pode levar até um minuto.
        </p>
      )}
    </form>
  );
}
