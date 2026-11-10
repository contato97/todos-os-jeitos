"use client";

import { useActionState } from "react";
import { Aviso, BotaoEnviar, CaixaMarcar, Campo } from "@/components/formulario";
import { assinarEncaminhamento } from "../../../../acoes";

export function FormularioAssinatura({ encaminhamentoId, nomeSugerido }: { encaminhamentoId: string; nomeSugerido: string }) {
  const [estado, acao] = useActionState(assinarEncaminhamento.bind(null, encaminhamentoId), {});
  if (estado.sucesso) return <Aviso tipo="sucesso">{estado.sucesso}</Aviso>;

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <Campo
        rotulo="Seu nome completo"
        name="nome"
        required
        minLength={3}
        maxLength={160}
        autoComplete="name"
        defaultValue={estado.valores?.nome ?? nomeSugerido}
      />
      <CaixaMarcar
        rotulo="Li o encaminhamento e estou ciente das orientações."
        name="ciente"
        dica="Sua assinatura fica registrada com data, hora e um código de verificação. Depois de assinado, o texto não muda mais."
      />
      <div>
        <BotaoEnviar enviando="Assinando...">Assinar encaminhamento</BotaoEnviar>
      </div>
    </form>
  );
}
