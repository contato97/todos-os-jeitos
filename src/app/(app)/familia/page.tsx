import { ComoUsar } from "@/components/area/como-usar";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import Link from "next/link";
import { EmBreve } from "@/components/area/em-breve";
import { criarClienteServidor } from "@/lib/supabase/server";

export default async function MeusFilhos() {
  const supabase = await criarClienteServidor();
  // Vinculos da familia. Antes do consentimento o RLS esconde os dados do aluno,
  // por isso "alunos" pode vir vazio nesses casos.
  const { data: vinculos } = await supabase
    .from("aluno_familias")
    .select("aluno_id, consentimento_em, alunos(nome)")
    .order("created_at");

  const liberados = vinculos?.filter((v) => v.consentimento_em) ?? [];
  const pendentes = vinculos?.filter((v) => !v.consentimento_em) ?? [];

  return (
    <>
      <h1 className="text-3xl font-semibold">Meus filhos</h1>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_FAMILIA.filhos} />
      </div>

      {pendentes.length > 0 && (
        <div className="mt-8">
          <EmBreve titulo="Consentimento pendente (etapa 8)">
            <p>
              Antes de ver as informações, você vai ler e aceitar como os dados do seu filho são
              usados e protegidos, conforme a LGPD.
            </p>
          </EmBreve>
        </div>
      )}

      {liberados.length === 0 && pendentes.length === 0 && (
        <p className="mt-8 rounded-2xl bg-white/70 p-6 ring-1 ring-marca/10">
          Nenhum filho vinculado ainda. O acesso chega pelo convite do professor, da professora ou da
          escola.
        </p>
      )}

      {liberados.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {liberados.map((v) => {
            const aluno = Array.isArray(v.alunos) ? v.alunos[0] : v.alunos;
            return (
              <li key={v.aluno_id}>
                <Link
                  href={`/familia/filhos/${v.aluno_id}`}
                  className="block rounded-2xl bg-white/70 p-5 text-xl font-semibold ring-1 ring-marca/10 hover:ring-petroleo"
                >
                  {aluno?.nome}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
