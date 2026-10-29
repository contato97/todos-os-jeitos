"use client";

import { useSearchParams } from "next/navigation";
import { sairETrocarConta } from "@/app/(auth)/actions";

const NOMES: Record<string, string> = {
  "area-de-escola": "da escola",
  "area-de-professor": "do professor",
  "area-de-familia": "da família",
  "area-de-especialista": "do especialista",
};

// Quem tenta abrir a area de outro perfil volta para a propria area.
// Este aviso explica o porque e oferece trocar de conta.
export function AvisoAreaErrada() {
  const aviso = useSearchParams().get("aviso");
  const area = aviso ? NOMES[aviso] : null;
  if (!area) return null;

  return (
    <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-l-4 border-mostarda bg-mostarda/15 p-4">
      <p>
        A área {area} é só para contas {area.replace("da ", "de ").replace("do ", "de ")}. Você está conectada com outra conta,
        por isso voltou para a sua área. Para ver a área {area}, saia e entre com a conta certa.
      </p>
      <form action={sairETrocarConta}>
        <button type="submit" className="rounded-full bg-marca px-5 py-2.5 font-medium text-creme hover:bg-petroleo">
          Sair e trocar de conta
        </button>
      </form>
    </div>
  );
}
