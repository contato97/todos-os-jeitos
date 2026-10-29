"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar } from "@/components/formulario";
import { TIPOS_REGISTRO_ESPECIALISTA } from "@/lib/opcoes-cadastro";
import { registrarInformacao } from "../../acoes";

const OPCAO =
  "flex cursor-pointer gap-3 rounded-2xl border-2 border-marca/15 p-4 has-checked:border-petroleo has-checked:bg-petroleo/5";

export function FormularioRegistro({ alunoId }: { alunoId: string }) {
  const [estado, acao] = useActionState(registrarInformacao.bind(null, alunoId), {});
  const v = estado.valores ?? {};

  return (
    // key: limpa o formulario depois de um registro enviado com sucesso
    <form key={estado.dado ?? "form"} action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-medium">Tipo de registro</legend>
        {TIPOS_REGISTRO_ESPECIALISTA.map((t) => (
          <label key={t.valor} className={OPCAO}>
            <input
              type="radio"
              name="tipo"
              value={t.valor}
              required
              defaultChecked={(v.tipo ?? "orientacao") === t.valor}
              className="mt-1.5 size-5 shrink-0 accent-petroleo"
            />
            <span>
              <span className="block font-semibold">{t.rotulo}</span>
              <span className="block text-base">{t.descricao}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <AreaTexto
        rotulo="Registro"
        name="texto"
        required
        rows={5}
        maxLength={5000}
        defaultValue={estado.sucesso ? "" : v.texto}
        dica="Ex.: oferecer pausas sensoriais a cada 20 minutos; evitar enunciados longos; usar apoio visual nas instruções."
      />
      <div>
        <BotaoEnviar enviando="Registrando...">Registrar</BotaoEnviar>
      </div>
    </form>
  );
}
