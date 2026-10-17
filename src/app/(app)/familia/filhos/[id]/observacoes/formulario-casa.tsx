"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { registrarObservacaoCasa } from "../../../acoes";

export function FormularioCasa({ alunoId, hoje }: { alunoId: string; hoje: string }) {
  const [estado, acao] = useActionState(registrarObservacaoCasa.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <AreaTexto
        rotulo="Como foi em casa?"
        name="texto"
        required
        rows={4}
        defaultValue={estado.valores?.texto}
        dica="Ex.: fez a lição sozinho depois de dividirmos em partes; ficou agitado com o barulho da obra."
      />
      <Campo rotulo="Data" name="data_observacao" type="date" defaultValue={hoje} max={hoje} />
      <div>
        <BotaoEnviar enviando="Enviando...">Enviar para o professor</BotaoEnviar>
      </div>
    </form>
  );
}
