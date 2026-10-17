"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { recuperarSenha } from "../actions";

export default function RecuperarSenhaPage() {
  const [estado, acao] = useActionState(recuperarSenha, {});

  return (
    <>
      <h1 className="text-3xl font-semibold">Esqueci minha senha</h1>
      <p className="mt-2">Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>

      <div className="mt-8">
        {estado.sucesso ? (
          <Aviso tipo="sucesso">{estado.sucesso}</Aviso>
        ) : (
          <form action={acao} className="flex flex-col gap-5">
            {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
            <Campo
              rotulo="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={estado.valores?.email}
            />
            <BotaoEnviar enviando="Enviando...">Enviar link</BotaoEnviar>
          </form>
        )}
      </div>

      <p className="mt-8 text-center">
        <Link href="/login" className="underline underline-offset-4">
          Voltar para o login
        </Link>
      </p>
    </>
  );
}
