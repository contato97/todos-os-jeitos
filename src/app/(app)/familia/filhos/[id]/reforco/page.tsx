import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function Reforco() {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.reforco} />
      <EmBreve titulo="Reforço e lição de casa (etapa 8)">
        <p>Peça uma atividade de reforço pensada para o seu filho, ou envie a lição de casa.</p>
        <p>A IA explica para você, adulto, como conduzir, sem dar as respostas prontas: a ideia é apoiar, sem fazer por ele.</p>
      </EmBreve>
    </>
  );
}
