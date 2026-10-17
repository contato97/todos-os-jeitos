import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function Relatorios() {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.relatorios} />
      <EmBreve titulo="Relatórios (etapa 6)">
        <p>Duas versões a partir das observações do período: acolhedora para a família e técnica para especialistas.</p>
        <p>A família só recebe a versão acolhedora, e só depois da sua revisão.</p>
      </EmBreve>
    </>
  );
}
