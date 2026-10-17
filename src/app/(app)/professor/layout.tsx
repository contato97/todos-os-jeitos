import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Guarda } from "@/components/area/guarda";
import { Navegacao } from "@/components/area/navegacao";

export default function LayoutProfessor({ children }: LayoutProps<"/professor">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Guarda tipo="professor">
        <Navegacao
          rotulo="Área do professor"
          itens={[
            { href: "/professor/alunos", rotulo: "Meus alunos" },
            { href: "/professor/ajuda", rotulo: "Ajuda" },
            { href: "/professor/conta", rotulo: "Minha conta" },
          ]}
        />
        <div className="mt-8">{children}</div>
      </Guarda>
    </Suspense>
  );
}
