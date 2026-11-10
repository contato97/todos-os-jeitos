"use client";

import { useActionState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, CaixaMarcar, Campo } from "@/components/formulario";
import { adicionarDocumentoEscola } from "@/app/(app)/escola/acoes";
import { TIPOS_DOCUMENTO_ESCOLA } from "@/lib/opcoes-cadastro";
import { reduzirNoCampo } from "@/lib/reduzir-imagem";

// A escola envia uma imagem/PDF e/ou escreve sobre um laudo ou relatorio
export function FormularioDocumentoEscola({ escolaId, alunoId }: { escolaId: string; alunoId: string }) {
  const [estado, acao] = useActionState(adicionarDocumentoEscola.bind(null, escolaId, alunoId), {});
  const v = estado.valores ?? {};

  return (
    // Depois de salvar, a chave muda e o formulario volta vazio
    <form key={estado.dado ?? "documento"} action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="tipo-documento" className="font-medium">
          Tipo
        </label>
        <select
          id="tipo-documento"
          name="tipo"
          required
          defaultValue={v.tipo ?? "laudo"}
          className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca focus:border-petroleo"
        >
          {TIPOS_DOCUMENTO_ESCOLA.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.rotulo}
            </option>
          ))}
        </select>
      </div>
      <Campo
        rotulo="Título"
        name="titulo"
        required
        maxLength={160}
        defaultValue={v.titulo}
        placeholder="Ex.: Laudo da neuropediatra (março/2026)"
      />
      <AreaTexto
        rotulo="O que diz o documento (opcional se enviar o arquivo)"
        name="texto"
        rows={4}
        maxLength={10000}
        defaultValue={v.texto}
        dica="Um resumo com as orientações mais importantes para a escola e a família."
      />
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="arquivo-documento" className="font-medium">
          Imagem ou PDF (opcional)
        </label>
        <input
          id="arquivo-documento"
          name="arquivo"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          // Fotos de celular sao reduzidas antes de enviar (limite do servidor)
          onChange={(e) => reduzirNoCampo(e.currentTarget)}
          className="w-full min-w-0 rounded-xl border-2 border-dashed border-marca/25 bg-white p-3 text-base file:mr-3 file:rounded-full file:border-0 file:bg-marca/10 file:px-4 file:py-2 file:font-medium"
        />
        <p className="text-base">Até 4 MB. Removemos dados escondidos das fotos, como localização.</p>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium">Quem mais pode ver</legend>
        <p className="text-base">O professor do aluno sempre vê.</p>
        <CaixaMarcar rotulo="A família do aluno" name="compartilhar_familia" />
        <CaixaMarcar rotulo="Os especialistas que acompanham o aluno" name="compartilhar_especialistas" />
      </fieldset>
      <div>
        <BotaoEnviar enviando="Salvando...">Salvar documento</BotaoEnviar>
      </div>
    </form>
  );
}
