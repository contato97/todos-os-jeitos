import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";

// A foto fica num bucket privado: para exibir, geramos um link temporario (1 hora)
export async function urlDaFoto(caminho: string | null | undefined) {
  if (!caminho) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase.storage.from("fotos").createSignedUrl(caminho, 3600);
  return data?.signedUrl ?? null;
}

// Logo da escola: bucket publico (logo nao e dado sensivel), entao o link e fixo
export function urlDoLogo(caminho: string | null | undefined) {
  if (!caminho) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${caminho}`;
}
