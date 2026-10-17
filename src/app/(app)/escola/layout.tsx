import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Guarda } from "@/components/area/guarda";
import { Navegacao } from "@/components/area/navegacao";

export default function LayoutEscola({ children }: LayoutProps<"/escola">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Guarda tipo="escola">
        <Navegacao
          rotulo="Área da escola"
          itens={[
            { href: "/escola", rotulo: "Visão geral", exato: true },
            { href: "/escola/professores", rotulo: "Professores" },
            { href: "/escola/alunos", rotulo: "Alunos" },
            { href: "/escola/ajuda", rotulo: "Central de ajuda" },
            { href: "/escola/conta", rotulo: "Minha conta" },
          ]}
        />
        <div className="mt-8">{children}</div>
      </Guarda>
    </Suspense>
  );
}
