import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function Historico() {
  return (
    <>
      <ComoUsar secao={AJUDA_FAMILIA.historico} />
      <EmBreve titulo="Histórico (etapa 8)">
        <p>Tudo o que a escola compartilhou com você: observações, atividades adaptadas e relatórios.</p>
        <p>Os relatórios aparecem na versão escrita para a família.</p>
      </EmBreve>
    </>
  );
}
