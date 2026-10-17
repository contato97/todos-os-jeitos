import Image from "next/image";
import Link from "next/link";

// Moldura das telas de acesso: logo no topo e um cartao central, sem distracoes
export default function LayoutAcesso({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <Link href="/" aria-label="Todos os Jeitos, voltar para a página inicial">
        <Image src="/logo.png" alt="" width={1082} height={380} priority className="h-16 w-auto" />
      </Link>
      <main className="mt-8 w-full max-w-md rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-marca/10 sm:p-8">
        {children}
      </main>
    </div>
  );
}
