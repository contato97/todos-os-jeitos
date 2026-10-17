import Link from "next/link";

// Provisorio: o login de verdade e construido na etapa 2.
export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold">Entrar</h1>
      <p>O acesso para professores, famílias e escolas está em construção.</p>
      <Link href="/" className="underline underline-offset-4">
        Voltar para a página inicial
      </Link>
    </main>
  );
}
