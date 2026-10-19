import { Suspense } from "react";
import { AreaComMenu } from "@/components/area/area-com-menu";
import { Carregando } from "@/components/area/em-breve";
import { Guarda } from "@/components/area/guarda";

export default function LayoutFamilia({ children }: LayoutProps<"/familia">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Guarda tipo="familia">
        <AreaComMenu
          rotulo="Área da família"
          grupos={[
            [{ href: "/familia", rotulo: "Meus filhos", icone: "filhos" }],
            [
              { href: "/familia/ajuda", rotulo: "Central de ajuda", icone: "ajuda" },
              { href: "/familia/conta", rotulo: "Minha conta", icone: "conta" },
            ],
          ]}
        >
          {children}
        </AreaComMenu>
      </Guarda>
    </Suspense>
  );
}
