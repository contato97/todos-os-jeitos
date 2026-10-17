"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { adaptarAtividade } from "../../../../acoes";

export function FormularioNovaAtividade({ alunoId }: { alunoId: string }) {
  const [estado, acao, enviando] = useActionState(adaptarAtividade.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <Campo rotulo="Título da atividade" name="titulo" required defaultValue={estado.valores?.titulo} placeholder="Ex.: Problemas de adição" />
      <AreaTexto
        rotulo="Texto da atividade"
        name="texto"
        rows={8}
        defaultValue={estado.valores?.texto}
        dica="Cole aqui o enunciado e as questões. Ou envie um PDF logo abaixo."
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="arquivo" className="font-medium">
          Ou envie um PDF (até 10 MB)
        </label>
        <input
          id="arquivo"
          name="arquivo"
          type="file"
          accept="application/pdf"
          className="rounded-xl border-2 border-dashed border-marca/25 bg-white p-3 file:mr-3 file:rounded-full file:border-0 file:bg-marca/10 file:px-4 file:py-2 file:font-medium"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <BotaoEnviar enviando="A IA está adaptando...">Adaptar com a IA</BotaoEnviar>
        {enviando && (
          <p role="status" className="text-base">
            Isso pode levar até um minuto. Pode deixar a página aberta.
          </p>
        )}
      </div>
      <p className="text-base">
        A IA recebe só as características do perfil, sem o nome do aluno e sem informações de saúde. O resultado chega como
        rascunho para você revisar.
      </p>
    </form>
  );
}
