import "server-only";
import { headers } from "next/headers";

// Endereco do site (localhost em desenvolvimento, o dominio real em producao),
// usado nos links enviados por e-mail e nos links de convite
export async function enderecoDoSite() {
  const h = await headers();
  return h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
}
