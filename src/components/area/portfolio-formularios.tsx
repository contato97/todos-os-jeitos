"use client";

import { useActionState } from "react";
import { EditorTexto } from "@/components/editor-texto";
import { Aviso, BotaoEnviar } from "@/components/formulario";
import { gerarPortfolio, salvarPortfolio } from "@/app/(app)/professor/acoes";

// Botao "Gerar com a IA" (ou "Gerar de novo") de um relatorio do portfolio
export function BotaoGerarPortfolio({
  alunoId,
  ano,
  tipo,
  existe,
}: {
  alunoId: string;
  ano: number;
  tipo: "inicial" | "final";
  existe: boolean;
}) {
  const [estado, acao, enviando] = useActionState(gerarPortfolio.bind(null, alunoId, ano, tipo), {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <div>
        <BotaoEnviar enviando="A IA está escrevendo..." secundario={existe}>
          {existe ? "Gerar de novo com a IA" : "Gerar com a IA"}
        </BotaoEnviar>
      </div>
      {enviando && (
        <p role="status" className="text-base">
          Isso pode levar até um minuto.
        </p>
      )}
    </form>
  );
}

// Revisao do relatorio do portfolio pelo professor
export function EditorPortfolio({ portfolio }: { portfolio: { id: string; conteudo: string | null; status: string } }) {
  const [estado, acao] = useActionState(salvarPortfolio.bind(null, portfolio.id), {});
  const revisado = portfolio.status === "revisado";

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="status" value={portfolio.status} />
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      {estado.aviso && <Aviso tipo="erro">{estado.aviso}</Aviso>}
      <EditorTexto rotulo="Relatório" name="conteudo" valorInicial={portfolio.conteudo ?? ""} />
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
