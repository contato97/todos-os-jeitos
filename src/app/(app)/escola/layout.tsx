import { Suspense } from "react";
import { AreaComMenu } from "@/components/area/area-com-menu";
import { Carregando } from "@/components/area/em-breve";
import { Guarda } from "@/components/area/guarda";

export default function LayoutEscola({ children }: LayoutProps<"/escola">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Guarda tipo="escola">
        <AreaComMenu
          rotulo="Área da escola"
          grupos={[
            [
              { href: "/escola", rotulo: "Visão geral", icone: "painel", exato: true },
              { href: "/escola/professores", rotulo: "Professores", icone: "professores", destaque: true },
              { href: "/escola/alunos", rotulo: "Alunos", icone: "alunos" },
            ],
            [
              { href: "/escola/ajuda", rotulo: "Central de ajuda", icone: "ajuda" },
              { href: "/escola/conta", rotulo: "Minha conta", icone: "conta" },
            ],
          ]}
        >
          {children}
        </AreaComMenu>
      </Guarda>
    </Suspense>
  );
}
