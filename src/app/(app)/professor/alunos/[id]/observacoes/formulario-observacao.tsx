"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, CaixaMarcar, Campo } from "@/components/formulario";
import { AREAS_OBSERVACAO } from "@/lib/opcoes-cadastro";
import { registrarObservacao } from "../../../acoes";

export function FormularioObservacao({ alunoId, hoje }: { alunoId: string; hoje: string }) {
  const [estado, acao] = useActionState(registrarObservacao.bind(null, alunoId), {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <AreaTexto
        rotulo="O que você observou?"
        name="texto"
        required
        rows={3}
        defaultValue={estado.valores?.texto}
        dica="Descreva o que aconteceu, do jeito que viu. Frases curtas bastam."
      />
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="materia" className="font-medium">
          Matéria ou área (opcional)
        </label>
        <select
          id="materia"
          name="materia"
          defaultValue={estado.valores?.materia ?? ""}
          className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca focus:border-petroleo"
        >
          <option value="">Geral</option>
          {AREAS_OBSERVACAO.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <p className="text-base">Ajuda a IA a organizar o relatório da família por matéria.</p>
      </div>
      <div className="grid items-end gap-4 sm:grid-cols-2">
        <Campo rotulo="Data" name="data_observacao" type="date" defaultValue={hoje} max={hoje} />
        <CaixaMarcar
          rotulo="Compartilhar com a família"
          name="visivel_familia"
          dica="Para a família, prefira um olhar pedagógico: evolução nos conteúdos, na socialização e no ambiente escolar."
        />
      </div>
      <div>
        <BotaoEnviar enviando="Registrando...">Registrar observação</BotaoEnviar>
      </div>
    </form>
  );
}
