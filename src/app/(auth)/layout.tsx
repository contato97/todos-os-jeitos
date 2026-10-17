import { BotaoTema } from "@/components/botao-tema";
import { Logo } from "@/components/logo";
import Link from "next/link";

// Moldura das telas de acesso: logo no topo e um cartao central, sem distracoes
export default function LayoutAcesso({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex flex-1 flex-col items-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <BotaoTema />
      </div>
      <Link href="/" aria-label="Todos os Jeitos, voltar para a página inicial">
        <Logo prioridade className="h-16 w-auto" />
      </Link>
      <main className="mt-8 w-full max-w-md rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-marca/10 sm:p-8">
        {children}
      </main>
    </div>
  );
}
