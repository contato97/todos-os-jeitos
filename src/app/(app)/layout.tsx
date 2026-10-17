import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/components/avatar";
import { AREA_DO_PERFIL, buscarUsuario } from "@/lib/auth";
import { urlDaFoto } from "@/lib/foto";
import { sair } from "../(auth)/actions";

// Moldura das areas logadas (professor, escola, familia)
export default function LayoutLogado({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-marca/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" aria-label="Todos os Jeitos, página inicial" className="shrink-0">
            <Image src="/logo.png" alt="" width={1082} height={380} priority className="h-12 w-auto" />
          </Link>
          {/* Ler o usuario depende da requisicao, entao fica dentro do Suspense:
              o resto da pagina aparece na hora e o nome chega logo depois */}
          <Suspense>
            <MenuUsuario />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
    </>
  );
}

async function MenuUsuario() {
  const usuario = await buscarUsuario();
  if (!usuario) return null;
  const foto = await urlDaFoto(usuario.foto);

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`${AREA_DO_PERFIL[usuario.tipo]}/conta`}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-marca/5"
        aria-label={`Minha conta (${usuario.nome})`}
      >
        <Avatar url={foto} nome={usuario.nome} />
        <span className="hidden sm:inline">{usuario.nome.split(" ")[0]}</span>
      </Link>
      <form action={sair}>
        <button type="submit" className="rounded-full px-4 py-2 font-medium ring-2 ring-marca hover:bg-marca/5">
          Sair
        </button>
      </form>
    </div>
  );
}
