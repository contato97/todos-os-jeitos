"use client";

import { useActionState } from "react";
import { Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { gerarRelatorio } from "../../../acoes";

export function FormularioNovoRelatorio({ alunoId, inicio, fim }: { alunoId: string; inicio: string; fim: string }) {
  const [estado, acao, enviando] = useActionState(gerarRelatorio.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="De" name="inicio" type="date" required defaultValue={estado.valores?.inicio ?? inicio} />
        <Campo rotulo="Até" name="fim" type="date" required defaultValue={estado.valores?.fim ?? fim} />
      </div>
      <div>
        <BotaoEnviar enviando="A IA está escrevendo...">Gerar relatório com a IA</BotaoEnviar>
      </div>
      {enviando && (
        <p role="status" className="text-base">
          Isso pode levar até um minuto.
        </p>
      )}
    </form>
  );
}
