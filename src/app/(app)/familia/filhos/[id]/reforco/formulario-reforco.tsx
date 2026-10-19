"use client";

import { useActionState, useState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { MATERIAS, TEMPOS_REFORCO, TIPOS_REFORCO } from "@/lib/opcoes-cadastro";
import { pedirApoio } from "../../../acoes";

const CARTAO = "flex cursor-pointer gap-3 rounded-2xl border-2 border-marca/15 p-4 has-checked:border-petroleo has-checked:bg-petroleo/5";
const PILULA =
  "flex cursor-pointer items-center gap-2 rounded-full border-2 border-marca/15 px-4 py-2 has-checked:border-petroleo has-checked:bg-petroleo/10";

export function FormularioReforco({ alunoId, nomeCrianca }: { alunoId: string; nomeCrianca: string }) {
  const [estado, acao, enviando] = useActionState(pedirApoio.bind(null, alunoId), {});
  const v = estado.valores ?? {};
  const [materia, setMateria] = useState(v.materia ?? "");
  const [tipo, setTipo] = useState(v.tipo ?? "reforco");

  return (
    <form action={acao} className="flex flex-col gap-6">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-semibold">1. O que você precisa?</legend>
        {TIPOS_REFORCO.map((o) => (
          <label key={o.valor} className={CARTAO}>
            <input
              type="radio"
              name="tipo"
              value={o.valor}
              checked={tipo === o.valor}
              onChange={() => setTipo(o.valor)}
              className="mt-1.5 size-5 shrink-0 accent-petroleo"
            />
            <span>
              <span className="block font-semibold">{o.rotulo}</span>
              <span className="block text-base">{o.descricao}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold">2. Qual matéria?</legend>
        <div className="flex flex-wrap gap-2">
          {[...MATERIAS, "outra"].map((m) => (
            <label key={m} className={PILULA}>
              <input
                type="radio"
                name="materia"
                value={m}
                required
                checked={materia === m}
                onChange={() => setMateria(m)}
                className="size-4 accent-petroleo"
              />
              {m === "outra" ? "Outra" : m}
            </label>
          ))}
        </div>
        {materia === "outra" && (
          <div className="mt-3">
            <Campo rotulo="Qual matéria?" name="materia_outra" required defaultValue={v.materia_outra} />
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-semibold">3. Conteúdo e tempo</legend>
        <Campo
          rotulo="Qual conteúdo vocês estão estudando?"
          name="tema"
          defaultValue={v.tema}
          placeholder="Ex.: frações, sílabas com R, ciclo da água"
        />
        <div>
          <span className="mb-2 block font-medium">Quanto tempo vocês têm?</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tempo disponível">
            {TEMPOS_REFORCO.map((t) => (
              <label key={t} className={PILULA}>
                <input type="radio" name="tempo" value={t} defaultChecked={(v.tempo ?? "20") === String(t)} className="size-4 accent-petroleo" />
                {t} minutos
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-semibold">4. Detalhes (opcional)</legend>
        <AreaTexto
          rotulo="Conte com suas palavras"
          name="pedido"
          rows={3}
          defaultValue={v.pedido}
          dica={`Ex.: ${nomeCrianca} entende somando com os dedos, mas trava quando tem “vai um”.`}
        />
        {tipo === "licao" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="foto" className="font-medium">
              Foto ou PDF da lição
            </label>
            <input
              id="foto"
              name="foto"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              capture="environment"
              className="w-full min-w-0 rounded-xl border-2 border-dashed border-marca/25 bg-white p-3 text-base file:mr-3 file:rounded-full file:border-0 file:bg-marca/10 file:px-4 file:py-2 file:font-medium"
            />
          </div>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <BotaoEnviar enviando="Preparando...">Pedir à assistente</BotaoEnviar>
        {enviando && (
          <p role="status" className="text-base">
            Preparando a orientação e o material. Pode levar até um minuto.
          </p>
        )}
      </div>
      <p className="text-base">
        A assistente usa o perfil de {nomeCrianca} (interesses, o que ajuda, o que trava), sem o nome nem dados de saúde. Ela
        orienta você, adulto, e não entrega respostas prontas da lição.
      </p>
    </form>
  );
}
