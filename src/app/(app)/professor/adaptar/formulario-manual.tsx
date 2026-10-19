"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { criarAtividadeManual } from "../acoes";

// Para quem ja tem a atividade adaptada: cola o texto e segue para a revisao
export function FormularioManual({ alunoId }: { alunoId: string }) {
  const [estado, acao] = useActionState(criarAtividadeManual.bind(null, alunoId), {});
  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <Campo rotulo="Título da atividade" name="titulo" required defaultValue={estado.valores?.titulo} />
      <AreaTexto
        rotulo="Atividade adaptada"
        name="conteudo"
        required
        rows={12}
        defaultValue={estado.valores?.conteudo}
        dica="Cole o texto. Dica de formatação: “# ” cria um título, “1. ” uma lista numerada e **texto** fica em negrito."
      />
      <div>
        <BotaoEnviar enviando="Salvando...">Continuar para a revisão</BotaoEnviar>
      </div>
    </form>
  );
}
