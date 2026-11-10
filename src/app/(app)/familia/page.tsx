import Link from "next/link";
import { ComoUsar } from "@/components/area/como-usar";
import { Cartao, Etiqueta, Vazio } from "@/components/ui";
import { AJUDA_FAMILIA } from "@/lib/ajuda";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioConsentimento } from "./formulario-consentimento";

export default async function MeusFilhos() {
  const supabase = await criarClienteServidor();
  const usuario = await buscarUsuario();
  const [{ data: pendentes }, { data: vinculos }, { data: naoLidas }] = await Promise.all([
    supabase.rpc("consentimentos_pendentes"),
    supabase
      .from("aluno_familias")
      .select("aluno_id, alunos(nome, ano_escolar)")
      .not("consentimento_em", "is", null)
      .order("created_at"),
    supabase.rpc("conversas_nao_lidas"),
  ]);
  const filhos = (vinculos ?? []).map((v) => ({ id: v.aluno_id, ...(Array.isArray(v.alunos) ? v.alunos[0] : v.alunos) }));
  const listaPendentes = (pendentes ?? []) as { aluno_id: string; primeiro_nome: string }[];
  const novas = new Map(((naoLidas ?? []) as { aluno_id: string; nao_lidas: number }[]).map((n) => [n.aluno_id, n.nao_lidas]));

  return (
    <>
      <h1 className="text-3xl font-semibold">Olá, {usuario?.nome?.split(" ")[0]}!</h1>
      <p className="mt-1">Acompanhe o dia a dia de quem você ama, junto com a escola.</p>
      <div className="mt-6">
        <ComoUsar secao={AJUDA_FAMILIA.filhos} />
      </div>

      {listaPendentes.map((p) => (
        <Cartao key={p.aluno_id} className="mb-6 max-w-3xl border-l-4 border-mostarda">
          <FormularioConsentimento alunoId={p.aluno_id} nomeAluno={p.primeiro_nome} />
        </Cartao>
      ))}

      {filhos.length === 0 && listaPendentes.length === 0 && (
        <Vazio>Nenhum filho vinculado ainda. O acesso chega pelo convite do professor, da professora ou da escola.</Vazio>
      )}

      {filhos.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filhos.map((f) => (
            <li key={f.id}>
              <Link href={novas.get(f.id) ? `/familia/filhos/${f.id}/conversa` : `/familia/filhos/${f.id}`} className="block">
                <Cartao className="hover:ring-petroleo">
                  <p className="text-xl font-semibold">{f.nome}</p>
                  {f.ano_escolar && <p>{f.ano_escolar}</p>}
                  {!!novas.get(f.id) && (
                    <p className="mt-2">
                      <Etiqueta tipo="rascunho">
                        {novas.get(f.id)} {novas.get(f.id) === 1 ? "recado novo do professor" : "recados novos do professor"}
                      </Etiqueta>
                    </p>
                  )}
                  <p className="mt-3 text-base underline underline-offset-4">Ver histórico, conversa e reforço</p>
                </Cartao>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
