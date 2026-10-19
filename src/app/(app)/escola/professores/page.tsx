import Link from "next/link";
import { ComoUsar } from "@/components/area/como-usar";
import { FormularioConvite } from "@/components/area/formulario-convite";
import { BOTAO_DISCRETO, Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { AJUDA_ESCOLA } from "@/lib/ajuda";
import { agoraIso } from "@/lib/datas";
import { cancelarConvite, convidarProfessor } from "../../acoes-convite";
import { removerProfessor } from "../acoes";
import { dadosDaEscola } from "../dados";

const ETAPAS: Record<string, string> = {
  infantil: "Infantil",
  fundamental_1: "Fund. I",
  fundamental_2: "Fund. II",
  medio: "Médio",
};

export default async function ProfessoresEscola() {
  const { supabase, escola, professores } = await dadosDaEscola();
  const { data: convites } = await supabase
    .from("convites")
    .select("id, email, expira_em")
    .eq("tipo", "professor")
    .is("usado_em", null)
    .order("created_at", { ascending: false });
  const agora = agoraIso();

  return (
    <>
      <h1 className="text-3xl font-semibold">Professores</h1>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_ESCOLA.professores} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Cartao>
            <h2 className="text-xl font-semibold">Convidar professor</h2>
            <p className="mb-4 mt-1">O professor recebe um link. Se ainda não tiver conta, cria uma com o mesmo e-mail.</p>
            {escola ? (
              <FormularioConvite acao={convidarProfessor.bind(null, escola.id)} rotuloBotao="Criar convite" />
            ) : (
              <p>Escola não encontrada.</p>
            )}
          </Cartao>
          {convites && convites.length > 0 && (
            <Cartao>
              <h2 className="text-lg font-semibold">Convites pendentes</h2>
              <ul className="mt-2 space-y-2">
                {convites.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {c.email}{" "}
                      {c.expira_em < agora ? <Etiqueta tipo="rascunho">Expirado</Etiqueta> : <span className="text-base">até {formatarData(c.expira_em)}</span>}
                    </span>
                    <form action={cancelarConvite.bind(null, c.id)}>
                      <button type="submit" className={BOTAO_DISCRETO}>
                        Cancelar
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </Cartao>
          )}
        </div>

        <section className="lg:col-span-3" aria-labelledby="titulo-vinculados">
          <h2 id="titulo-vinculados" className="mb-3 text-xl font-semibold">
            Professores vinculados
          </h2>
          {professores.length === 0 ? (
            <Vazio>Nenhum professor vinculado ainda.</Vazio>
          ) : (
            <ul className="space-y-3">
              {professores.map((p) => (
                <li key={p.id}>
                  <Cartao className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link href={`/escola/professores/${p.id}`} className="font-semibold underline-offset-4 hover:underline">
                        {p.nome}
                      </Link>
                      <p className="text-base">
                        {p.etapas.map((e) => ETAPAS[e] ?? e).join(", ")}
                        {p.atuacao && ` · ${p.atuacao === "polivalente" ? "Base comum" : "Uma matéria"}`} · desde {formatarData(p.desde)}
                      </p>
                    </div>
                    {escola && (
                      <form action={removerProfessor.bind(null, escola.id, p.id)}>
                        <button type="submit" className={BOTAO_DISCRETO}>
                          Desvincular
                        </button>
                      </form>
                    )}
                  </Cartao>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
