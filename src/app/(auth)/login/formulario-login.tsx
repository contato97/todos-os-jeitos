"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Aviso, BotaoEnviar, Campo, CampoSenha } from "@/components/formulario";
import { entrar } from "../actions";

export function FormularioLogin() {
  // useActionState liga o formulario a Server Action e guarda a resposta (erro, valores)
  const [estado, acao] = useActionState(entrar, {});
  const linkInvalido = useSearchParams().get("aviso") === "link-invalido";

  return (
    <form action={acao} className="flex flex-col gap-5">
      {linkInvalido && !estado.erro && (
        <Aviso tipo="erro">
          Este link expirou ou já foi usado. Entre com sua senha ou peça um novo link.
        </Aviso>
      )}
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}

      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={estado.valores?.email}
      />
      <CampoSenha rotulo="Senha" name="senha" autoComplete="current-password" required />

      <BotaoEnviar enviando="Entrando...">Entrar</BotaoEnviar>

      <Link href="/recuperar-senha" className="text-center underline underline-offset-4">
        Esqueci minha senha
      </Link>
    </form>
  );
}
