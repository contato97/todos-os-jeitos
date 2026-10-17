import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function Observacoes() {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.observacoes} />
      <EmBreve titulo="Observações (etapa 4)">
        <p>Registros rápidos com data. Você escolhe quais a família pode ver.</p>
        <p>As observações enviadas pela família aparecem aqui com a etiqueta “de casa”.</p>
      </EmBreve>
    </>
  );
}
