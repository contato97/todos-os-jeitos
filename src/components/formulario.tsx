"use client";

import { useId, useState } from "react";
import { useFormStatus } from "react-dom";

// Peças de formulario reaproveitadas em todas as telas.
// Cada campo tem um <label> ligado ao <input>: o leitor de tela le o nome do campo,
// e clicar no texto coloca o cursor no campo.

type CampoProps = React.InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  dica?: string;
};

export function Campo({ rotulo, dica, id, ...props }: CampoProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idDica = dica ? `${idCampo}-dica` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={idCampo} className="font-medium">
        {rotulo}
      </label>
      <input
        id={idCampo}
        aria-describedby={idDica}
        className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca placeholder:text-marca/50 focus:border-petroleo"
        {...props}
      />
      {dica && (
        <p id={idDica} className="text-base">
          {dica}
        </p>
      )}
    </div>
  );
}

// Campo de senha com botao "Mostrar": ajuda quem tem dificuldade de digitar
// sem ver o que escreveu
export function CampoSenha({ rotulo, dica, ...props }: CampoProps) {
  const [visivel, setVisivel] = useState(false);
  const id = useId();
  const idDica = dica ? `${id}-dica` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {rotulo}
      </label>
      <div className="flex rounded-xl border-2 border-marca/25 bg-white focus-within:border-petroleo">
        <input
          id={id}
          type={visivel ? "text" : "password"}
          aria-describedby={idDica}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-marca"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel(!visivel)}
          aria-pressed={visivel}
          className="rounded-xl px-4 text-base font-medium text-petroleo"
        >
          {visivel ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {dica && (
        <p id={idDica} className="text-base">
          {dica}
        </p>
      )}
    </div>
  );
}

// Botao que mostra "Enviando..." e fica desativado enquanto o servidor responde,
// para a pessoa nao clicar duas vezes
export function BotaoEnviar({ children, enviando }: { children: React.ReactNode; enviando: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-marca px-6 py-3 font-medium text-creme hover:bg-petroleo disabled:opacity-70"
    >
      {pending ? enviando : children}
    </button>
  );
}

// Mensagens de erro e sucesso. role="alert" faz o leitor de tela anunciar o erro na hora.
export function Aviso({ tipo, children }: { tipo: "erro" | "sucesso"; children: React.ReactNode }) {
  const estilo =
    tipo === "erro"
      ? "border-coral bg-coral/10"
      : "border-salvia bg-salvia/10";
  return (
    <p role={tipo === "erro" ? "alert" : "status"} className={`rounded-xl border-l-4 p-4 ${estilo}`}>
      {children}
    </p>
  );
}
