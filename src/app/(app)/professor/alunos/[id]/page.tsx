import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function PerfilVivo() {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.perfil} />
      <EmBreve titulo="Perfil vivo (etapa 3)">
        <p>Interesses, pontos fortes, o que funciona, o que trava, comunicação e sensorial, sempre editáveis.</p>
        <p>O perfil cresce com as observações da escola e de casa.</p>
      </EmBreve>
    </>
  );
}
