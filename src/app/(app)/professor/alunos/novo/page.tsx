import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { EmBreve } from "@/components/area/em-breve";

export default function NovoAluno() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Novo aluno</h1>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_PROFESSOR.novoAluno} />
      </div>
      <div className="mt-8">
        <EmBreve titulo="Cadastro do perfil vivo (etapa 3)">
          <p>
            Nome, ano escolar, interesses, pontos fortes, o que funciona, o que trava, como prefere
            receber instruções e sensibilidades sensoriais.
          </p>
          <p>Informações de saúde ficam num campo opcional, que só você vê e que nunca vai para a IA.</p>
        </EmBreve>
      </div>
    </>
  );
}
