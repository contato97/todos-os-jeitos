import Link from "next/link";
import { ComoUsar } from "@/components/area/como-usar";
import { Cartao, Vazio } from "@/components/ui";
import { AJUDA_ESCOLA } from "@/lib/ajuda";
import { dadosDaEscola } from "../dados";

export default async function AlunosEscola() {
  const { supabase, professores } = await dadosDaEscola();
  const { data: alunos } = await supabase.from("alunos").select("id, nome, ano_escolar, professor_id").order("nome");
  const nomeProf = new Map(professores.map((p) => [p.id, p.nome]));

  return (
    <>
      <h1 className="text-3xl font-semibold">Alunos</h1>
      <p className="mt-1">Alunos acompanhados pelos professores vinculados à escola.</p>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_ESCOLA.alunos} />
      </div>
      {!alunos?.length ? (
        <Vazio>Quando os professores vinculados cadastrarem alunos, eles aparecem aqui.</Vazio>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alunos.map((a) => (
            <li key={a.id}>
              <Link href={`/escola/alunos/${a.id}`} className="block">
                <Cartao className="hover:ring-petroleo">
                  <p className="text-lg font-semibold">{a.nome}</p>
                  <p className="text-base">
                    {a.ano_escolar ? `${a.ano_escolar} · ` : ""}
                    {nomeProf.get(a.professor_id)}
                  </p>
                </Cartao>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
