"use client";

import { useActionState } from "react";
import { Aviso, BotaoEnviar, Campo, CampoSenha } from "@/components/formulario";
import { aceitarConvite, cadastrarFamilia } from "../acoes";
import { SENHA_MINIMA } from "../../mensagens";

export function BotaoAceitar({ token }: { token: string }) {
  const [estado, acao] = useActionState(aceitarConvite.bind(null, token), {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <BotaoEnviar enviando="Aceitando...">Aceitar convite</BotaoEnviar>
    </form>
  );
}

export function CadastroFamilia({ token, emailDica }: { token: string; emailDica: string }) {
  const [estado, acao] = useActionState(cadastrarFamilia.bind(null, token), {});
  if (estado.sucesso) return <Aviso tipo="sucesso">{estado.sucesso}</Aviso>;

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <Campo rotulo="Seu nome" name="nome" autoComplete="name" required defaultValue={estado.valores?.nome} />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={estado.valores?.email}
        dica={`Use o e-mail que recebeu o convite (${emailDica}).`}
      />
      <CampoSenha rotulo="Crie uma senha" name="senha" autoComplete="new-password" required minLength={SENHA_MINIMA} dica={`Pelo menos ${SENHA_MINIMA} caracteres.`} />
      <BotaoEnviar enviando="Criando conta...">Criar minha conta</BotaoEnviar>
    </form>
  );
}
