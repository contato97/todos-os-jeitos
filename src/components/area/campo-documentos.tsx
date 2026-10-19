"use client";

import { useEffect, useRef, useState } from "react";
import { LIMITE_ENVIO, reduzirImagens, tamanhoLegivel } from "@/lib/reduzir-imagem";

const ACEITOS = "application/pdf,.pdf,image/jpeg,image/png,image/webp,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const tamanho = tamanhoLegivel;

// Campo para anexar laudos e relatorios (PDF, foto ou Word), com a lista do que foi escolhido.
// "limpar" muda quando o formulario e enviado com sucesso, para esvaziar a lista.
export function CampoDocumentos({ limpar }: { limpar?: unknown }) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const entrada = useRef<HTMLInputElement>(null);

  function atualizar(lista: File[]) {
    setArquivos(lista);
    const dt = new DataTransfer();
    lista.forEach((a) => dt.items.add(a));
    if (entrada.current) entrada.current.files = dt.files;
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- esvazia a lista depois de enviar com sucesso
    if (limpar) atualizar([]);
  }, [limpar]);

  // Se o formulario for "resetado" pelo React (ex.: erro do servidor), devolve os arquivos ao campo
  useEffect(() => {
    if (!entrada.current || entrada.current.files?.length === arquivos.length) return;
    const dt = new DataTransfer();
    arquivos.forEach((a) => dt.items.add(a));
    entrada.current.files = dt.files;
  });

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-medium">Documentos de profissionais de saúde (opcional)</span>
      <p className="text-base">
        Laudos e relatórios em PDF, foto ou Word. Até 5 arquivos, 4 MB no total (as fotos são reduzidas automaticamente). Só você acessa, e eles nunca vão para a IA.
      </p>
      <label className="w-fit cursor-pointer rounded-full px-5 py-2.5 font-medium ring-2 ring-marca hover:bg-marca/5">
        Anexar documentos
        <input
          ref={entrada}
          type="file"
          name="documentos"
          multiple
          accept={ACEITOS}
          className="sr-only"
          onChange={async (e) => {
            // Fotos reduzidas no navegador (cabem no limite de envio e continuam legiveis)
            const novos = await reduzirImagens(Array.from(e.target.files ?? []));
            const juntos = [...arquivos, ...novos].filter((a, i, l) => l.findIndex((b) => b.name === a.name && b.size === a.size) === i);
            atualizar(juntos);
          }}
        />
      </label>
      {arquivos.reduce((t, a) => t + a.size, 0) > LIMITE_ENVIO && (
        <p role="alert" className="rounded-xl border-l-4 border-coral bg-coral/10 p-3">
          Os documentos passam de 4 MB no total. Anexe em partes (salve e depois anexe o restante).
        </p>
      )}
      {arquivos.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Documentos escolhidos">
          {arquivos.map((a, i) => (
            <li key={`${a.name}-${a.size}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-2 ring-1 ring-marca/10">
              <span className="min-w-0 break-all">
                {a.name} <span className="text-base">· {tamanho(a.size)}</span>
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
    </div>
  );
}
