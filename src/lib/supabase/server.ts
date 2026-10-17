import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

// Cliente do Supabase para o servidor (paginas, Server Actions, rotas).
// Um cliente novo por requisicao: cada pedido tem os cookies do seu proprio usuario.
export async function criarClienteServidor() {
  // connection() avisa o Next que daqui em diante tudo depende da requisicao.
  // Sem isso, o Next reclama porque o Supabase le a hora atual (para conferir
  // se o login venceu) numa fase em que a pagina ainda esta sendo pre-montada.
  await connection();
  const cookieStore = await cookies();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase não configurado: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local e reinicie o servidor.",
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Paginas nao podem gravar cookies, so Server Actions e rotas.
            // Tudo bem: o proxy.ts ja renova a sessao a cada requisicao.
          }
        },
      },
    },
  );
}
