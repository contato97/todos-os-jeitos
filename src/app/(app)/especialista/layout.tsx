import { Suspense } from "react";
import { AreaComMenu } from "@/components/area/area-com-menu";
import { Carregando } from "@/components/area/em-breve";
import { Guarda } from "@/components/area/guarda";

export default function LayoutEspecialista({ children }: LayoutProps<"/especialista">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Guarda tipo="especialista">
        <AreaComMenu
          rotulo="Área do especialista"
          grupos={[
            [{ href: "/especialista", rotulo: "Meus alunos", icone: "alunos" }],
            [
              { href: "/especialista/ajuda", rotulo: "Central de ajuda", icone: "ajuda" },
              { href: "/especialista/conta", rotulo: "Minha conta", icone: "conta" },
            ],
          ]}
        >
          {children}
        </AreaComMenu>
      </Guarda>
    </Suspense>
  );
}
