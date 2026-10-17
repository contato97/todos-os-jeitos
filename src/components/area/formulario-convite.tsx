"use client";

import { useActionState, useState } from "react";
import { Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import type { EstadoFormulario } from "@/lib/formulario";

// Formulario de convite (familia ou professor). Depois de criar, mostra o link
// para copiar ou mandar pelo WhatsApp, caso o e-mail nao esteja configurado.
export function FormularioConvite({
  acao,
  comParentesco = false,
  rotuloBotao,
}: {
  acao: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  comParentesco?: boolean;
  rotuloBotao: string;
}) {
  const [estado, enviar] = useActionState(acao, {});
  const [copiado, setCopiado] = useState(false);

  return (
    <form action={enviar} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      {estado.dado && (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-4 ring-1 ring-marca/10">
          <span className="font-medium">Link do convite (vale 7 dias)</span>
          <code className="break-all text-base">{estado.dado}</code>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(estado.dado!).then(() => setCopiado(true))}
              className="rounded-full px-4 py-1.5 text-base font-medium ring-2 ring-marca"
            >
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Olá! Segue o convite para a Todos os Jeitos: ${estado.dado}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-1.5 text-base font-medium ring-2 ring-marca"
            >
              Enviar pelo WhatsApp
            </a>
          </div>
        </div>
      )}
      <Campo rotulo="E-mail" name="email" type="email" required defaultValue={estado.valores?.email} autoComplete="off" />
      {comParentesco && (
        <Campo rotulo="Parentesco (opcional)" name="parentesco" defaultValue={estado.valores?.parentesco} placeholder="Ex.: mãe, pai, avó" />
      )}
      <div>
        <BotaoEnviar enviando="Criando convite...">{rotuloBotao}</BotaoEnviar>
      </div>
    </form>
  );
}
