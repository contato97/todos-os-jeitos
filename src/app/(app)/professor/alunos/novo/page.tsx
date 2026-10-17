import Link from "next/link";
import { ComoUsar } from "@/components/area/como-usar";
import { Cartao } from "@/components/ui";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import { FormularioAluno } from "../formulario-aluno";

export default function NovoAluno() {
  return (
    <>
      <Link href="/professor/alunos" className="underline underline-offset-4">
        ← Meus alunos
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Novo aluno</h1>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_PROFESSOR.novoAluno} />
      </div>
      <Cartao className="max-w-3xl">
        <FormularioAluno modo="novo" />
      </Cartao>
    </>
  );
}
