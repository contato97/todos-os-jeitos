"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { PRIORIDADES_ADAPTACAO } from "@/lib/opcoes-cadastro";
import { adaptarAtividade } from "../../../../acoes";

const LIMITE_ARQUIVOS = 6;
const LIMITE_TOTAL = 10 * 1024 * 1024;
const ACEITOS = "image/*,application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain";

function tamanho(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function rotuloTipo(arquivo: File) {
  const n = arquivo.name.toLowerCase();
  if (arquivo.type.startsWith("image/")) return "Foto";
  if (n.endsWith(".pdf")) return "PDF";
  if (n.endsWith(".docx")) return "Word";
  if (n.endsWith(".txt")) return "Texto";
  return "Arquivo";
}

export function FormularioNovaAtividade({ alunoId, retorno }: { alunoId: string; retorno?: "adaptar" }) {
  const [estado, acao, enviando] = useActionState(adaptarAtividade.bind(null, alunoId), {});
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const prioridadesMarcadas = estado.valores?.prioridades?.split(",") ?? ["linguagem", "etapas", "interesses"];

  // O <input type="file"> e quem envia os arquivos: sempre que a lista muda,
  // copiamos a lista para ele (DataTransfer e a forma do navegador de montar essa lista)
  function atualizar(lista: File[]) {
    const unicos = lista.filter((a, i) => lista.findIndex((b) => b.name === a.name && b.size === a.size) === i);
    setArquivos(unicos);
    const dt = new DataTransfer();
    unicos.forEach((a) => dt.items.add(a));
    if (entrada.current) entrada.current.files = dt.files;
  }

  // Depois de um erro do servidor o React limpa o formulario: devolvemos os arquivos ao campo
  useEffect(() => {
    const dt = new DataTransfer();
    arquivos.forEach((a) => dt.items.add(a));
    if (entrada.current) entrada.current.files = dt.files;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- so quando chega uma resposta nova
  }, [estado]);

  const total = arquivos.reduce((t, a) => t + a.size, 0);
  const problema =
    arquivos.length > LIMITE_ARQUIVOS
      ? `Envie no máximo ${LIMITE_ARQUIVOS} arquivos.`
      : total > LIMITE_TOTAL
        ? "Os arquivos passam de 10 MB no total."
        : null;

  return (
    <form action={acao} className="flex flex-col gap-6">
      {retorno && <input type="hidden" name="retorno" value={retorno} />}
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}

      <Campo rotulo="Título da atividade" name="titulo" required defaultValue={estado.valores?.titulo} placeholder="Ex.: Problemas de adição" />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium">A atividade original</legend>
        <p className="text-base">Fotos da folha, PDF, Word (.docx) ou texto. Até {LIMITE_ARQUIVOS} arquivos, 10 MB no total.</p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            atualizar([...arquivos, ...Array.from(e.dataTransfer.files)]);
          }}
          className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center ${
            arrastando ? "border-petroleo bg-petroleo/5" : "border-marca/25 bg-white"
          }`}
        >
          <p className="font-medium">Arraste os arquivos para cá</p>
          <p className="text-base">ou</p>
          <div className="flex flex-wrap justify-center gap-3">
            <label className="cursor-pointer rounded-full bg-marca px-5 py-2.5 font-medium text-creme hover:bg-petroleo">
              Escolher arquivos
              <input
                ref={entrada}
                type="file"
                name="arquivos"
                multiple
                accept={ACEITOS}
                className="sr-only"
                onChange={(e) => atualizar([...arquivos, ...Array.from(e.target.files ?? [])])}
              />
            </label>
            {/* No celular, abre direto a camera para fotografar a folha */}
            <label className="cursor-pointer rounded-full px-5 py-2.5 font-medium ring-2 ring-marca">
              Tirar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => atualizar([...arquivos, ...Array.from(e.target.files ?? [])])}
              />
            </label>
          </div>
        </div>

        {arquivos.length > 0 && (
          <ul className="flex flex-col gap-2" aria-label="Arquivos escolhidos">
            {arquivos.map((a, i) => (
              <li key={`${a.name}-${a.size}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-2 ring-1 ring-marca/10">
                <span className="min-w-0">
                  <span className="mr-2 rounded-full bg-marca/10 px-2 py-0.5 text-sm font-medium">{rotuloTipo(a)}</span>
                  <span className="break-all">{a.name}</span> <span className="text-base">· {tamanho(a.size)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => atualizar(arquivos.filter((_, j) => j !== i))}
                  className="shrink-0 text-base underline underline-offset-4"
                  aria-label={`Remover ${a.name}`}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
        {problema && <Aviso tipo="erro">{problema}</Aviso>}

        <details className="mt-2" open={Boolean(estado.valores?.texto)}>
          <summary className="cursor-pointer font-medium underline underline-offset-4">Ou cole o texto da atividade</summary>
          <div className="mt-3">
            <AreaTexto rotulo="Texto da atividade" name="texto" rows={8} defaultValue={estado.valores?.texto} />
          </div>
        </details>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-medium">O que a IA deve priorizar?</legend>
        <div className="flex flex-wrap gap-2">
          {PRIORIDADES_ADAPTACAO.map((p) => (
            <label
              key={p.valor}
              className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-marca/15 px-4 py-2 has-checked:border-petroleo has-checked:bg-petroleo/10"
            >
              <input type="checkbox" name="prioridades" value={p.valor} defaultChecked={prioridadesMarcadas.includes(p.valor)} className="size-4 accent-petroleo" />
              {p.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      <AreaTexto
        rotulo="Orientações para a IA (opcional)"
        name="orientacoes"
        rows={2}
        defaultValue={estado.valores?.orientacoes}
        dica="Ex.: manter as 5 questões da prova; ele já domina a tabuada do 2; usar letra de forma."
      />

      <div className="flex flex-wrap items-center gap-4">
        <BotaoEnviar enviando="A IA está adaptando...">Adaptar com a IA</BotaoEnviar>
        {enviando && (
          <p role="status" className="text-base">
            Lendo os arquivos e adaptando. Pode levar até um minuto.
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
