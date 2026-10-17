import { exigirUsuario, type TipoPerfil } from "@/lib/auth";

// Porteiro de cada area: confere o login e o tipo de perfil antes de mostrar
// qualquer coisa. Um professor que tentar abrir /escola volta para /professor.
// (O RLS do banco continua sendo a protecao principal dos dados.)
export async function Guarda({ tipo, children }: { tipo: TipoPerfil; children: React.ReactNode }) {
  await exigirUsuario(tipo);
  return children;
}
