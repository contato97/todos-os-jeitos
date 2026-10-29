import Link from "next/link";
import { Suspense } from "react";
import { ComoUsar } from "@/components/area/como-usar";
import { Carregando } from "@/components/area/em-breve";
import { Cartao, Etiqueta, Vazio } from "@/components/ui";
import { AJUDA_ESPECIALISTA } from "@/lib/ajuda";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";

export default function PainelEspecialista() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Meus alunos</h1>
      <p className="mt-1 mb-6">Os alunos que as escolas pediram para você acompanhar.</p>
      <ComoUsar secao={AJUDA_ESPECIALISTA.alunos} />
      <Suspense fallback={<Carregando />}>
        <Lista />
      </Suspense>
    </>
  );
}

async function Lista() {
  const usuario = await buscarUsuario();
  const supabase = await criarClienteServidor();
  const [{ data: vinculos }, { data: escolas }] = await Promise.all([
    supabase
      .from("especialista_alunos")
      .select("aluno_id, escola_id, ver_relatorios, pode_registrar, alunos(nome, ano_escolar)")
      .eq("especialista_id", usuario?.id ?? ""),
    supabase.from("escolas").select("id, nome"),
  ]);
  const nomeEscola = new Map((escolas ?? []).map((e) => [e.id, e.nome]));
  // Se o professor saiu da escola, o RLS ja esconde o aluno: some da lista
  const alunos = (vinculos ?? [])
    .map((v) => ({ ...v, aluno: Array.isArray(v.alunos) ? v.alunos[0] : v.alunos }))
    .filter((v) => v.aluno)
    .sort((a, b) => a.aluno!.nome.localeCompare(b.aluno!.nome));

  if (!alunos.length) {
    return (
      <Vazio>
        {escolas?.length
          ? `Você já está na plataforma${escolas.length === 1 ? ` com ${escolas[0].nome}` : ""}. Assim que a escola escolher os alunos que você acompanha, eles aparecem aqui.`
          : "Você ainda não está vinculado(a) a nenhuma escola. Peça o convite à coordenação ou direção."}
      </Vazio>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {alunos.map((v) => (
        <li key={v.aluno_id}>
          <Link href={`/especialista/alunos/${v.aluno_id}`} className="block rounded-2xl focus-visible:outline-4">
            <Cartao className="h-full hover:ring-2 hover:ring-petroleo">
              <h2 className="text-xl font-semibold">{v.aluno!.nome}</h2>
              <p className="mt-1 text-base">
                {[v.aluno!.ano_escolar, nomeEscola.get(v.escola_id)].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {v.ver_relatorios && <Etiqueta>Vê relatórios</Etiqueta>}
                {v.pode_registrar && <Etiqueta>Pode registrar</Etiqueta>}
              </div>
            </Cartao>
          </Link>
        </li>
      ))}
    </ul>
  );
}
