import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Guarda } from "@/components/area/guarda";
import { MenuLateral } from "@/components/area/menu-lateral";

export default function LayoutProfessor({ children }: LayoutProps<"/professor">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Guarda tipo="professor">
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
          <aside className="min-w-0 lg:border-r lg:border-marca/10 lg:pr-6">
            <MenuLateral
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
            />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </Guarda>
    </Suspense>
  );
}
