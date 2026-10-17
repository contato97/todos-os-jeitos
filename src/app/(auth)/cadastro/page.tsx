import Link from "next/link";

// Provisorio: o cadastro de verdade e construido na etapa 2.
export default function CadastroPage() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold">Criar conta</h1>
      <p>O cadastro de professores e escolas está em construção.</p>
      <Link href="/" className="underline underline-offset-4">
        Voltar para a página inicial
      </Link>
    </main>
  );
}
