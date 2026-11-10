"use client";

import { useActionState, useRef } from "react";
import { AreaTexto, Aviso, BotaoEnviar } from "@/components/formulario";
import { enviarMensagem } from "@/app/(app)/acoes-mensagens";

// Caixa de escrever da conversa. Se a revisao segurar o recado, mostra o motivo
// e uma sugestao reescrita que a pessoa pode usar (ou editar) antes de enviar.
export function FormularioMensagem({ alunoId, dica }: { alunoId: string; dica: string }) {
  const [estado, acao] = useActionState(enviarMensagem.bind(null, alunoId), {});
  const campo = useRef<HTMLTextAreaElement>(null);
  const sugestao = estado.aviso ? estado.dado : undefined;

  return (
    // Depois de enviar, a chave muda e o formulario volta vazio
    <form key={estado.sucesso ? estado.dado : "conversa"} action={acao} className="flex flex-col gap-3">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      {estado.aviso && (
        <div role="alert" className="rounded-2xl border-l-4 border-mostarda bg-mostarda/15 p-4">
          <p className="font-semibold">O recado ainda não foi enviado</p>
          <p className="mt-1">{estado.aviso}</p>
          {sugestao && (
            <>
              <p className="mt-3 font-medium">Sugestão:</p>
              <p className="mt-1 whitespace-pre-line rounded-xl bg-white p-3">{sugestao}</p>
              <button
                type="button"
                onClick={() => {
                  if (campo.current) {
                    campo.current.value = sugestao;
                    campo.current.focus();
                  }
                }}
                className="mt-3 rounded-full px-4 py-2 font-medium ring-2 ring-marca hover:bg-marca/5"
              >
                Usar esta versão
              </button>
            </>
          )}
        </div>
      )}
      <AreaTexto
        ref={campo}
        rotulo="Seu recado"
        name="texto"
        required
        rows={3}
        maxLength={2000}
        defaultValue={estado.sucesso ? "" : estado.valores?.texto}
        dica={dica}
      />
      <div>
        <BotaoEnviar enviando="Revisando e enviando...">Enviar recado</BotaoEnviar>
      </div>
    </form>
  );
}
