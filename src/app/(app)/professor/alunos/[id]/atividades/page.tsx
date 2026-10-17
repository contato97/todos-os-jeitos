import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function Atividades() {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.atividades} />
      <EmBreve titulo="Atividades adaptadas (etapa 5)">
        <p>Envie um texto ou PDF e a IA adapta pelo perfil vivo. O resultado chega como rascunho para você revisar e editar.</p>
        <p>Só atividades revisadas podem ser exportadas em PDF ou compartilhadas com a família.</p>
      </EmBreve>
    </>
  );
}
