"use client";

import { useActionState } from "react";
import { EditorTexto } from "@/components/editor-texto";
import { Aviso, BotaoEnviar, CaixaMarcar } from "@/components/formulario";
import { ESPECIALIDADES_ENCAMINHAMENTO } from "@/lib/opcoes-cadastro";
import { salvarEncaminhamento } from "../../../../acoes";

type Encaminhamento = {
  id: string;
  conteudo: string | null;
  especialidades: string[];
  status: string;
  compartilhado_com_familia: boolean;
};

export function EditorEncaminhamento({ encaminhamento, avisoInicial }: { encaminhamento: Encaminhamento; avisoInicial?: string }) {
  const [estado, acao] = useActionState(salvarEncaminhamento.bind(null, encaminhamento.id), {});
  const revisado = encaminhamento.status === "revisado";
  const aviso = estado.aviso ?? (estado.sucesso ? undefined : avisoInicial);

  return (
    <form action={acao} className="flex flex-col gap-5">
      <input type="hidden" name="status" value={encaminhamento.status} />
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      {aviso && <Aviso tipo="erro">{aviso}</Aviso>}

      <EditorTexto rotulo="Encaminhamento" name="conteudo" valorInicial={encaminhamento.conteudo ?? ""} />

      <fieldset>
        <legend className="mb-2 font-medium">Profissionais sugeridos para avaliação</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ESPECIALIDADES_ENCAMINHAMENTO.map((e) => (
            <label key={e.valor} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="especialidades"
                value={e.valor}
                defaultChecked={encaminhamento.especialidades.includes(e.valor)}
                className="size-5 accent-petroleo"
              />
              {e.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      {revisado && (
        <CaixaMarcar
          rotulo="Enviar para a família assinar"
          name="compartilhar"
          defaultChecked={encaminhamento.compartilhado_com_familia}
          dica="A família lê, assina pela plataforma e pode imprimir para levar à consulta. Depois da assinatura, o texto não muda mais."
        />
      )}

      <div className="flex flex-wrap gap-3">
        {revisado ? (
          <>
            <BotaoEnviar enviando="Salvando..." name="acao" value="salvar">
              Salvar
            </BotaoEnviar>
            <BotaoEnviar enviando="Salvando..." name="acao" value="reabrir" secundario>
              Voltar para rascunho
            </BotaoEnviar>
          </>
        ) : (
          <>
            <BotaoEnviar enviando="Salvando..." name="acao" value="revisar">
              Revisei e aprovo
            </BotaoEnviar>
            <BotaoEnviar enviando="Salvando..." name="acao" value="salvar" secundario>
              Salvar rascunho
            </BotaoEnviar>
          </>
        )}
      </div>
    </form>
  );
}
