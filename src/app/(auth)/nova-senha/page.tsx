"use client";

import { useActionState } from "react";
import { Aviso, BotaoEnviar, CampoSenha } from "@/components/formulario";
import { definirNovaSenha } from "../actions";
import { SENHA_MINIMA } from "../mensagens";

// So chega aqui quem abriu o link de recuperacao (o proxy exige login)
export default function NovaSenhaPage() {
  const [estado, acao] = useActionState(definirNovaSenha, {});

  return (
    <>
      <h1 className="text-3xl font-semibold">Criar nova senha</h1>
      <form action={acao} className="mt-8 flex flex-col gap-5">
        {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
        <CampoSenha
          rotulo="Nova senha"
          name="senha"
          autoComplete="new-password"
          required
          minLength={SENHA_MINIMA}
          dica={`Use pelo menos ${SENHA_MINIMA} caracteres.`}
        />
        <CampoSenha
          rotulo="Repita a nova senha"
          name="confirmacao"
          autoComplete="new-password"
          required
        />
        <BotaoEnviar enviando="Salvando...">Salvar nova senha</BotaoEnviar>
      </form>
    </>
  );
}
