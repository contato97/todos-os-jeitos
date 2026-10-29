"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar } from "@/components/formulario";
import { CAMPOS_CASA } from "@/lib/opcoes-cadastro";
import { salvarComoEmCasa } from "../../../acoes";

export function FormularioComoEmCasa({ alunoId, atuais }: { alunoId: string; atuais: Record<string, string> }) {
  const [estado, acao] = useActionState(salvarComoEmCasa.bind(null, alunoId), {});
  const v = estado.valores ?? atuais;

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      {CAMPOS_CASA.map((c) => (
        <AreaTexto
          key={c.nome}
          rotulo={c.ia ? c.rotulo : `${c.rotulo} 🔒`}
          name={c.nome}
          rows={3}
          maxLength={2000}
          defaultValue={v[c.nome]}
          dica={c.dica}
        />
      ))}
      <p className="text-base">🔒 Só você e o professor veem. Nunca vai para a inteligência artificial.</p>
      <div>
        <BotaoEnviar enviando="Salvando...">Salvar</BotaoEnviar>
      </div>
    </form>
  );
}
