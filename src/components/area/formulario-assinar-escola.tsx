"use client";

import { useActionState } from "react";
import { Aviso, BotaoEnviar, CaixaMarcar, Campo } from "@/components/formulario";
import { assinarComoEscola } from "@/app/(app)/escola/acoes";

// Assinatura da escola (coordenacao/direcao) num relatorio ou encaminhamento
export function FormularioAssinarEscola({
  documento,
  id,
  nomeSugerido,
}: {
  documento: "relatorio" | "encaminhamento";
  id: string;
  nomeSugerido: string;
}) {
  const [estado, acao] = useActionState(assinarComoEscola.bind(null, documento, id), {});
  if (estado.sucesso) return <Aviso tipo="sucesso">{estado.sucesso}</Aviso>;

  return (
    <details className="mt-2">
      <summary className="cursor-pointer font-medium underline underline-offset-4">Assinar pela escola</summary>
      <form action={acao} className="mt-3 flex flex-col gap-3 rounded-2xl bg-creme p-4">
        {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
        <Campo
          rotulo="Nome completo de quem assina"
          name="nome"
          required
          minLength={3}
          maxLength={160}
          defaultValue={estado.valores?.nome ?? nomeSugerido}
        />
        <CaixaMarcar
          rotulo={`Li este ${documento === "relatorio" ? "relatório" : "encaminhamento"} e assino em nome da escola.`}
          name="ciente"
          dica="Fica registrado com seu cargo, data, hora e um código de verificação. Depois de assinado, o texto não muda mais."
        />
        <div>
          <BotaoEnviar enviando="Assinando...">Assinar</BotaoEnviar>
        </div>
      </form>
    </details>
  );
}
