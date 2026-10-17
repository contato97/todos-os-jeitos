import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_ESCOLA } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function ProfessoresEscola() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Professores</h1>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_ESCOLA.professores} />
      </div>
      <div className="mt-8">
        <EmBreve titulo="Professores da escola (etapa 9)">
          <p>Convide professores por e-mail. Quando aceitam, eles passam a aparecer aqui.</p>
          <p>Você acompanha os alunos e as adaptações de cada um, sem poder editar nada.</p>
        </EmBreve>
      </div>
    </>
  );
}
