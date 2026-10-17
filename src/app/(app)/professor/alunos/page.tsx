import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";
import Link from "next/link";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function MeusAlunos() {
  const supabase = await criarClienteServidor();
  // O RLS ja filtra: o professor so recebe os proprios alunos
  const { data: alunos } = await supabase
    .from("alunos")
    .select("id, nome, ano_escolar, atualizado_em")
    .order("nome");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Meus alunos</h1>
        <Link
          href="/professor/alunos/novo"
          className="rounded-full bg-marca px-5 py-2 font-medium text-creme hover:bg-petroleo"
        >
          Novo aluno
        </Link>
      </div>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_PROFESSOR.alunos} />
      </div>

      {!alunos?.length ? (
        <p className="mt-8 rounded-2xl bg-white/70 p-6 ring-1 ring-marca/10">
          Você ainda não cadastrou nenhum aluno. Comece pelo botão <strong>Novo aluno</strong>: o
          perfil vivo é o ponto de partida de tudo na plataforma.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alunos.map((aluno) => (
            <li key={aluno.id}>
              <Link
                href={`/professor/alunos/${aluno.id}`}
                className="block rounded-2xl bg-white/70 p-5 ring-1 ring-marca/10 hover:ring-petroleo"
              >
                <span className="block text-xl font-semibold">{aluno.nome}</span>
                {aluno.ano_escolar && <span className="block">{aluno.ano_escolar}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
