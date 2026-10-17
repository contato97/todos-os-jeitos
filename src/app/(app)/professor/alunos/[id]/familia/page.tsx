import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function Familia() {
  return (
    <>
      <ComoUsar secao={AJUDA_PROFESSOR.familia} />
      <EmBreve titulo="Família (etapa 8)">
        <p>Convide a família por e-mail. No primeiro acesso, ela registra o consentimento (LGPD).</p>
        <p>Aqui você também acompanha o reforço que a família faz em casa.</p>
      </EmBreve>
    </>
  );
}
