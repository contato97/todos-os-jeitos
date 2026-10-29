"use client";

import { useActionState } from "react";
import { EditorTexto } from "@/components/editor-texto";
import { AreaTexto, Aviso, BotaoEnviar, CaixaMarcar, Campo } from "@/components/formulario";
import { salvarAtividade } from "../../../../acoes";

type Atividade = {
  id: string;
  titulo: string;
  conteudo_adaptado: string | null;
  status: string;
  compartilhado_com_familia: boolean;
  dicas_familia?: string | null;
};

export function EditorAtividade({ atividade, avisoInicial }: { atividade: Atividade; avisoInicial?: string }) {
  const [estado, acao] = useActionState(salvarAtividade.bind(null, atividade.id), {});
  const revisada = atividade.status === "revisado";
  const aviso = estado.aviso ?? (estado.sucesso ? undefined : avisoInicial);

  return (
    <form action={acao} className="flex flex-col gap-5">
      <input type="hidden" name="status" value={atividade.status} />
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      {aviso && <Aviso tipo="erro">{aviso}</Aviso>}

      <Campo rotulo="Título" name="titulo" required defaultValue={atividade.titulo} />
      <EditorTexto rotulo="Atividade adaptada" name="conteudo" valorInicial={atividade.conteudo_adaptado ?? ""} />

      <AreaTexto
        rotulo="Dicas do professor para a família (opcional)"
        name="dicas_familia"
        rows={3}
        maxLength={3000}
        defaultValue={atividade.dicas_familia ?? ""}
        dica="Aparece para a família junto com a atividade. Ex.: “Em casa, deixe ele contar com feijões e leia o enunciado em voz alta.” As dicas para o professor, geradas pela IA, a família não vê."
      />

      {revisada && (
        <CaixaMarcar
          rotulo="Compartilhar com a família"
          name="compartilhar"
          defaultChecked={atividade.compartilhado_com_familia}
          dica="A família vê esta atividade no histórico do filho."
        />
      )}

      <div className="flex flex-wrap gap-3">
        {revisada ? (
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
