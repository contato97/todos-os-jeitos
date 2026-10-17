import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormularioCadastro } from "./formulario-cadastro";

export const metadata: Metadata = { title: "Criar conta | Todos os Jeitos" };

export default function CadastroPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Criar conta</h1>
      <p className="mt-2">Comece a acompanhar cada aluno do jeito dele.</p>

      <div className="mt-8">
        {/* Le o endereco (?proximo=...), por isso fica dentro do Suspense */}
        <Suspense>
          <FormularioCadastro />
        </Suspense>
      </div>

      <hr className="my-8 border-marca/10" />
      <p className="text-center">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium underline underline-offset-4">
          Entrar
        </Link>
      </p>
      <p className="mt-3 text-center text-base">
        É da família? Seu acesso chega por convite do professor, da professora ou da escola.
      </p>
    </>
  );
}
