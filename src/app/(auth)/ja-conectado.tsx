import Link from "next/link";
import { AREA_DO_PERFIL, buscarUsuario } from "@/lib/auth";
import { sairETrocarConta } from "./actions";

const TIPO: Record<string, string> = { professor: "professor(a)", escola: "escola", familia: "família" };

// Nas telas de entrar/criar conta: avisa se ja existe alguem conectado neste navegador
export async function JaConectado() {
  const usuario = await buscarUsuario();
  if (!usuario) return null;

  return (
    <div role="status" className="mb-8 flex flex-col gap-3 rounded-2xl border-l-4 border-petroleo bg-petroleo/10 p-4">
      <p>
        Você já está conectada como <strong>{usuario.nome}</strong> ({TIPO[usuario.tipo]}).
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href={AREA_DO_PERFIL[usuario.tipo]} className="rounded-full bg-marca px-5 py-2 font-medium text-creme hover:bg-petroleo">
          Ir para minha área
        </Link>
        <form action={sairETrocarConta}>
          <button type="submit" className="rounded-full px-5 py-2 font-medium ring-2 ring-marca hover:bg-marca/5">
            Sair e usar outra conta
          </button>
        </form>
      </div>
    </div>
  );
}
