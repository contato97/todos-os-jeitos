import type { Metadata } from "next";
import { EmBreve } from "@/components/area/em-breve";

export const metadata: Metadata = { title: "Convite | Todos os Jeitos" };

// Destino do link de convite enviado por e-mail (familia ou professor)
export default function Convite() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Você recebeu um convite</h1>
      <div className="mt-8">
        <EmBreve titulo="Aceitar convite (etapas 8 e 9)">
          <p>
            Famílias criam a conta aqui, com o e-mail que recebeu o convite. Professores convidados
            por uma escola entram e confirmam o vínculo.
          </p>
        </EmBreve>
      </div>
    </>
  );
}
