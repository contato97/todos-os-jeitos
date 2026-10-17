import { notFound } from "next/navigation";
import { FormularioAluno } from "@/app/(app)/professor/alunos/formulario-aluno";
import { Cartao } from "@/components/ui";

// So em desenvolvimento: ver o cadastro de aluno em etapas sem precisar de login
export default function CadastroAlunoTeste() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="mx-auto w-full max-w-3xl p-8">
      <Cartao>
        <FormularioAluno modo="novo" />
      </Cartao>
    </main>
  );
}
