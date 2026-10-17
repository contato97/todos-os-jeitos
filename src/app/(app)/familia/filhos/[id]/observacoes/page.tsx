import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function ObservacoesFamilia() {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.observacoes} />
      <EmBreve titulo="Observações de casa (etapa 8)">
        <p>Conte como foi a lição, o que ajudou e o que foi difícil. O professor recebe e usa isso para ajustar as atividades.</p>
      </EmBreve>
    </>
  );
}
