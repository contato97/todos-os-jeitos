"use client";

import { useActionState } from "react";
import { Aviso, BotaoEnviar, CaixaMarcar } from "@/components/formulario";
import { darConsentimento } from "./acoes";

// Termo de consentimento (LGPD). TEXTO PROVISORIO: revisar com assessoria juridica.
export function FormularioConsentimento({ alunoId, nomeAluno }: { alunoId: string; nomeAluno: string }) {
  const [estado, acao] = useActionState(darConsentimento.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Antes de começar: como cuidamos dos dados de {nomeAluno}</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          A escola registra na plataforma o perfil de aprendizagem, observações, atividades e relatórios de {nomeAluno}, para
          adaptar o ensino ao jeito dele.
        </li>
        <li>Você vê o que o professor escolher compartilhar e pode enviar observações de casa.</li>
        <li>
          Usamos inteligência artificial para adaptar atividades e apoiar o reforço. A IA recebe só características de
          aprendizagem, <strong>nunca o nome nem informações de saúde</strong>.
        </li>
        <li>Os dados não são vendidos nem usados para publicidade.</li>
        <li>
          Você pode pedir para ver, corrigir ou apagar os dados, ou retirar este consentimento, falando com a escola ou com a
          Todos os Jeitos.
        </li>
      </ul>
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <CaixaMarcar
        name="aceito"
        rotulo={`Li e concordo com o uso dos dados de ${nomeAluno} como descrito acima.`}
        dica="Sou responsável legal pela criança."
      />
      <div>
        <BotaoEnviar enviando="Registrando...">Concordo e quero acompanhar</BotaoEnviar>
      </div>
    </form>
  );
}
