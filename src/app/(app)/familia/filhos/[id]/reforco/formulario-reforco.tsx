"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar } from "@/components/formulario";
import { pedirApoio } from "../../../acoes";

const OPCOES = [
  { valor: "reforco", titulo: "Quero uma atividade de reforço", texto: "Ex.: leitura de 15 minutos, tabuada brincando." },
  { valor: "licao", titulo: "Preciso de ajuda com a lição", texto: "Envie a foto e diga onde ele travou." },
];

export function FormularioReforco({ alunoId }: { alunoId: string }) {
  const [estado, acao, enviando] = useActionState(pedirApoio.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-medium">O que você precisa?</legend>
        {OPCOES.map((o) => (
          <label
            key={o.valor}
            className="flex cursor-pointer gap-3 rounded-2xl border-2 border-marca/15 p-4 has-checked:border-petroleo has-checked:bg-petroleo/5"
          >
            <input
              type="radio"
              name="tipo"
              value={o.valor}
              defaultChecked={(estado.valores?.tipo ?? "reforco") === o.valor}
              className="mt-1.5 size-5 shrink-0 accent-petroleo"
            />
            <span>
              <span className="block font-semibold">{o.titulo}</span>
              <span className="block text-base">{o.texto}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <AreaTexto
        rotulo="Conte com suas palavras"
        name="pedido"
        required
        rows={4}
        defaultValue={estado.valores?.pedido}
        dica="Ex.: ele está com dificuldade em subtração com empréstimo; temos 15 minutos depois do jantar."
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="foto" className="font-medium">
          Foto ou PDF da lição (opcional)
        </label>
        <input
          id="foto"
          name="foto"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          capture="environment"
          className="rounded-xl border-2 border-dashed border-marca/25 bg-white p-3 file:mr-3 file:rounded-full file:border-0 file:bg-marca/10 file:px-4 file:py-2 file:font-medium"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <BotaoEnviar enviando="Preparando a orientação...">Pedir orientação</BotaoEnviar>
        {enviando && (
          <p role="status" className="text-base">
            Isso pode levar até um minuto.
          </p>
        )}
      </div>
      <p className="text-base">
        A orientação é para você, adulto, conduzir com a criança. A IA não entrega respostas prontas da lição.
      </p>
    </form>
  );
}
