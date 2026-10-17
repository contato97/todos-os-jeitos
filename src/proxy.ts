import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/proxy";

// O proxy roda antes de cada pagina: mantem o login do usuario renovado.
export async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  // Ignora arquivos estaticos (imagens, icone, CSS/JS do Next)
  matcher: ["/((?!_next/static|_next/image|icon.png|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
