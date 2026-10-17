"use client";

import { useActionState } from "react";
import { CampoDocumentos } from "@/components/area/campo-documentos";
import { Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { anexarDocumentos } from "../../acoes";

export function FormularioDocumentos({ alunoId }: { alunoId: string }) {
  const [estado, acao] = useActionState(anexarDocumentos.bind(null, alunoId), {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <CampoDocumentos limpar={estado.sucesso ? estado : undefined} />
      <Campo rotulo="Descrição (opcional)" name="descricao" placeholder="Ex.: Laudo da neuropediatra, março/2026" maxLength={300} />
      <div>
        <BotaoEnviar enviando="Enviando...">Salvar documentos</BotaoEnviar>
      </div>
    </form>
  );
}
