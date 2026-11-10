"use client";

import { useActionState } from "react";
import { Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { gerarRelatorio } from "../../../acoes";

export function FormularioNovoRelatorio({
  alunoId,
  inicio,
  fim,
  ano,
}: {
  alunoId: string;
  inicio: string;
  fim: string;
  ano: number;
}) {
  const [estado, acao, enviando] = useActionState(gerarRelatorio.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor="bimestre" className="font-medium">
            Bimestre
          </label>
          <select
            id="bimestre"
            name="bimestre"
            defaultValue={estado.valores?.bimestre ?? ""}
            className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca focus:border-petroleo"
          >
            <option value="">Sem bimestre</option>
            {[1, 2, 3, 4].map((b) => (
              <option key={b} value={b}>
                {b}º bimestre
              </option>
            ))}
          </select>
        </div>
        <Campo
          rotulo="Ano letivo"
          name="ano_letivo"
          type="number"
          min={2020}
          max={2100}
          defaultValue={estado.valores?.ano_letivo || String(ano)}
        />
        <Campo rotulo="De" name="inicio" type="date" required defaultValue={estado.valores?.inicio ?? inicio} />
        <Campo rotulo="Até" name="fim" type="date" required defaultValue={estado.valores?.fim ?? fim} />
      </div>
      <p className="text-base">
        Com o bimestre, o relatório entra na linha do tempo do aluno, que a família pode imprimir e levar às consultas.
      </p>
      <div>
        <BotaoEnviar enviando="A IA está escrevendo...">Gerar relatório com a IA</BotaoEnviar>
      </div>
      {enviando && (
        <p role="status" className="text-base">
          Isso pode levar até um minuto.
        </p>
      )}
    </form>
  );
}
