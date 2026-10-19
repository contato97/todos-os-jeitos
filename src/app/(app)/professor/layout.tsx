import { Suspense } from "react";
import { AreaComMenu } from "@/components/area/area-com-menu";
import { Carregando } from "@/components/area/em-breve";
import { Guarda } from "@/components/area/guarda";

export default function LayoutProfessor({ children }: LayoutProps<"/professor">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Guarda tipo="professor">
        <AreaComMenu
          rotulo="Área do professor"
          grupos={[
            [
              { href: "/professor", rotulo: "Painel", icone: "painel", exato: true },
              { href: "/professor/alunos", rotulo: "Meus alunos", icone: "alunos" },
              { href: "/professor/adaptar", rotulo: "Adaptar atividade", icone: "adaptar", destaque: true },
              { href: "/professor/familias", rotulo: "Comunicação com a família", icone: "familias" },
              { href: "/professor/convidar", rotulo: "Convidar família", icone: "convidar" },
            ],
            [
              { href: "/professor/ajuda", rotulo: "Central de ajuda", icone: "ajuda" },
              { href: "/professor/conta", rotulo: "Minha conta", icone: "conta" },
            ],
          ]}
        >
          {children}
        </AreaComMenu>
      </Guarda>
    </Suspense>
  );
}
