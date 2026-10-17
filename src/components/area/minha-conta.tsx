import { EmBreve } from "@/components/area/em-breve";
import { buscarUsuario } from "@/lib/auth";

export async function MinhaConta() {
  const usuario = await buscarUsuario();

  return (
    <>
      <h1 className="text-3xl font-semibold">Minha conta</h1>
      <p className="mt-4">
        Você entrou como <strong>{usuario?.nome}</strong>.
      </p>
      <div className="mt-8">
        <EmBreve titulo="Editar dados da conta">
          <p>Em breve você vai poder alterar seu nome, seus dados e sua senha por aqui.</p>
        </EmBreve>
      </div>
    </>
  );
}
