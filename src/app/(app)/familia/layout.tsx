import { Suspense } from "react";
import { Carregando } from "@/components/area/em-breve";
import { Guarda } from "@/components/area/guarda";
import { Navegacao } from "@/components/area/navegacao";

export default function LayoutFamilia({ children }: LayoutProps<"/familia">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Guarda tipo="familia">
        <Navegacao
          rotulo="Área da família"
          itens={[
            { href: "/familia", rotulo: "Meus filhos", exato: true },
            { href: "/familia/ajuda", rotulo: "Ajuda" },
            { href: "/familia/conta", rotulo: "Minha conta" },
          ]}
        />
        <div className="mt-8">{children}</div>
      </Guarda>
    </Suspense>
  );
}
