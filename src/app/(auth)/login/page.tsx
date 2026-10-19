import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { JaConectado } from "../ja-conectado";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Entrar | Todos os Jeitos" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Entrar</h1>
      <p className="mt-2">Professores, escolas e famílias entram por aqui.</p>

      <Suspense>
        <JaConectado />
      </Suspense>
      <div className="mt-8">
        {/* O formulario le o endereco da pagina (?aviso=...), por isso fica dentro do Suspense */}
        <Suspense>
          <FormularioLogin />
        </Suspense>
      </div>

      <hr className="my-8 border-marca/10" />
      <p className="text-center">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium underline underline-offset-4">
          Criar conta
        </Link>
      </p>
      <p className="mt-3 text-center text-base">
        É da família? Seu acesso chega por convite do professor, da professora ou da escola.
      </p>
    </>
  );
}
