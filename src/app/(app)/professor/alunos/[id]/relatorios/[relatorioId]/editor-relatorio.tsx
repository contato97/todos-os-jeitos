"use client";

import { useActionState } from "react";
import { EditorTexto } from "@/components/editor-texto";
import { Aviso, BotaoEnviar, CaixaMarcar } from "@/components/formulario";
import { salvarRelatorio } from "../../../../acoes";

type Relatorio = {
  id: string;
  versao_familia: string | null;
  versao_tecnica: string | null;
  status: string;
  compartilhado_com_familia: boolean;
};

export function EditorRelatorio({ relatorio, avisoInicial }: { relatorio: Relatorio; avisoInicial?: string }) {
  const [estado, acao] = useActionState(salvarRelatorio.bind(null, relatorio.id), {});
  const revisado = relatorio.status === "revisado";
  const aviso = estado.aviso ?? (estado.sucesso ? undefined : avisoInicial);

  return (
    <form action={acao} className="flex flex-col gap-6">
      <input type="hidden" name="status" value={relatorio.status} />
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      {aviso && <Aviso tipo="erro">{aviso}</Aviso>}

      <EditorTexto rotulo="Versão para a família" name="versao_familia" valorInicial={relatorio.versao_familia ?? ""} linhas={14} />
      <EditorTexto rotulo="Versão técnica (especialistas)" name="versao_tecnica" valorInicial={relatorio.versao_tecnica ?? ""} linhas={14} />

      {revisado && (
        <CaixaMarcar
          rotulo="Compartilhar a versão para a família"
          name="compartilhar"
          defaultChecked={relatorio.compartilhado_com_familia}
          dica="A família vê só a versão acolhedora. A versão técnica nunca aparece para ela."
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
