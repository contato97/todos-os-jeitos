import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_ESCOLA } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function AlunosEscola() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Alunos</h1>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_ESCOLA.alunos} />
      </div>
      <div className="mt-8">
        <EmBreve titulo="Alunos acompanhados (etapa 9)">
          <p>Lista dos alunos dos professores vinculados, com o perfil vivo e as atividades revisadas.</p>
          <p>
            Por segurança, a escola não vê informações de saúde nem as observações do dia a dia da
            sala.
          </p>
        </EmBreve>
      </div>
    </>
  );
}
