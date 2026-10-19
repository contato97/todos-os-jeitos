"use client";

import { useActionState, useState } from "react";
import { Aviso, BotaoEnviar, Campo, CampoSenha } from "@/components/formulario";
import { ATUACOES, CARGOS, ETAPAS, REDES } from "@/lib/opcoes-cadastro";
import { reduzirNoCampo } from "@/lib/reduzir-imagem";
import { alterarEmail, alterarSenha, enviarFoto, removerFoto, salvarDados } from "@/app/(app)/conta-acoes";

const SENHA_MINIMA = 8;
const OPCAO = "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-marca/15 p-3 has-checked:border-petroleo has-checked:bg-petroleo/5";

export function FormularioFoto({ urlAtual, nome }: { urlAtual: string | null; nome: string }) {
  const [estado, acao] = useActionState(enviarFoto, {});
  const [previa, setPrevia] = useState<string | null>(null);
  const mostrar = previa ?? urlAtual;
  const iniciais = nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      {mostrar ? (
        // eslint-disable-next-line @next/next/no-img-element -- previa local (blob:) e link temporario
        <img src={mostrar} alt="Sua foto de perfil" className="size-28 shrink-0 rounded-full object-cover ring-4 ring-white" />
      ) : (
        <span aria-hidden="true" className="flex size-28 shrink-0 items-center justify-center rounded-full bg-lavanda/30 text-4xl font-semibold">
          {iniciais}
        </span>
      )}
      <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
        {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
        {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
        <form action={acao} className="flex flex-col gap-3">
          <label htmlFor="foto" className="font-medium">
            Escolher foto
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              // Reduz a foto no navegador antes de enviar (cabe no limite do servidor)
              const arquivo = await reduzirNoCampo(e.currentTarget);
              setPrevia(arquivo ? URL.createObjectURL(arquivo) : null);
            }}
            className="w-full min-w-0 rounded-xl border-2 border-dashed border-marca/25 bg-white p-3 text-base file:mr-3 file:rounded-full file:border-0 file:bg-marca/10 file:px-4 file:py-2 file:font-medium"
          />
          <div className="flex flex-wrap gap-3">
            <BotaoEnviar enviando="Enviando...">Salvar foto</BotaoEnviar>
          </div>
        </form>
        {urlAtual && !previa && (
          <form action={removerFoto}>
            <button type="submit" className="text-base underline underline-offset-4">
              Remover foto
            </button>
          </form>
        )}
        <p className="text-base">A foto é cortada em formato quadrado. Removemos dados escondidos da imagem, como localização.</p>
      </div>
    </div>
  );
}

type DadosConta = {
  tipo: "professor" | "escola" | "familia";
  nome: string;
  escola?: string;
  rede?: string;
  etapas?: string[];
  atuacao?: string;
  cargo?: string;
};

export function FormularioDados({ dados }: { dados: DadosConta }) {
  const [estado, acao] = useActionState(salvarDados, {});

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <Campo
        rotulo={dados.tipo === "escola" ? "Responsável pela conta" : "Seu nome"}
        name="nome"
        required
        defaultValue={dados.nome}
        autoComplete="name"
      />

      {dados.tipo !== "familia" && (
        <Campo rotulo="Nome da escola" name="escola" required defaultValue={dados.escola} autoComplete="organization" />
      )}

      {dados.tipo === "professor" && (
        <>
          <fieldset>
            <legend className="mb-2 font-medium">A escola é</legend>
            <div className="flex gap-3">
              {REDES.map((r) => (
                <label key={r.valor} className={`${OPCAO} flex-1`}>
                  <input type="radio" name="rede" value={r.valor} defaultChecked={dados.rede === r.valor} className="size-5 accent-petroleo" />
                  {r.rotulo}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-medium">Etapas em que leciona</legend>
            <div className="flex flex-col gap-2">
              {ETAPAS.map((e) => (
                <label key={e.valor} className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" name="etapas" value={e.valor} defaultChecked={dados.etapas?.includes(e.valor)} className="size-5 accent-petroleo" />
                  {e.rotulo}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-medium">Como você atua</legend>
            {ATUACOES.map((a) => (
              <label key={a.valor} className={OPCAO}>
                <input type="radio" name="atuacao" value={a.valor} defaultChecked={dados.atuacao === a.valor} className="size-5 shrink-0 accent-petroleo" />
                <span>
                  <span className="block font-semibold">{a.rotulo}</span>
                  <span className="block text-base">{a.descricao}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </>
      )}

      {dados.tipo === "escola" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="cargo" className="font-medium">
            Cargo
          </label>
          <select
            id="cargo"
            name="cargo"
            defaultValue={dados.cargo}
            className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca focus:border-petroleo"
          >
            {CARGOS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <BotaoEnviar enviando="Salvando...">Salvar dados</BotaoEnviar>
      </div>
    </form>
  );
}

export function FormularioSenha() {
  const [estado, acao] = useActionState(alterarSenha, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <CampoSenha rotulo="Senha atual" name="atual" autoComplete="current-password" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSenha rotulo="Nova senha" name="nova" autoComplete="new-password" required minLength={SENHA_MINIMA} dica={`Pelo menos ${SENHA_MINIMA} caracteres.`} />
        <CampoSenha rotulo="Repita a nova senha" name="confirmacao" autoComplete="new-password" required />
      </div>
      <div>
        <BotaoEnviar enviando="Alterando...">Alterar senha</BotaoEnviar>
      </div>
    </form>
  );
}

export function FormularioEmail({ emailAtual }: { emailAtual: string }) {
  const [estado, acao] = useActionState(alterarEmail, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      <p>
        E-mail atual: <strong>{emailAtual}</strong>
      </p>
      <Campo rotulo="Novo e-mail" name="email" type="email" required autoComplete="email" defaultValue={estado.valores?.email} />
      <div>
        <BotaoEnviar enviando="Enviando...">Trocar e-mail</BotaoEnviar>
      </div>
    </form>
  );
}
