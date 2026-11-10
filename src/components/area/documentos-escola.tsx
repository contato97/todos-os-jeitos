import { BOTAO_DISCRETO, Cartao, Etiqueta, formatarData } from "@/components/ui";
import { alterarCompartilhamentoDocumento, apagarDocumentoEscola } from "@/app/(app)/escola/acoes";
import { rotuloTipoDocumento } from "@/lib/opcoes-cadastro";
import { criarClienteServidor } from "@/lib/supabase/server";

// Laudos e relatorios que a escola guardou sobre o aluno.
// Quem ve cada um e decidido pelo RLS: professor do aluno sempre; familia e
// especialistas so quando a escola compartilha. "gerenciar" = tela da escola.
export async function DocumentosEscola({ alunoId, gerenciar = false }: { alunoId: string; gerenciar?: boolean }) {
  const supabase = await criarClienteServidor();
  const { data: documentos } = await supabase
    .from("escola_documentos")
    .select("id, tipo, titulo, texto, arquivo, arquivo_nome, arquivo_tipo, compartilhar_familia, compartilhar_especialistas, created_at")
    .eq("aluno_id", alunoId)
    .order("created_at", { ascending: false });
  if (!documentos?.length) {
    return <p className="text-base">{gerenciar ? "Nenhum documento ainda." : "Nenhum documento compartilhado pela escola ainda."}</p>;
  }

  // Links temporarios (10 min) para abrir os arquivos do bucket privado
  const caminhos = documentos.map((d) => d.arquivo).filter((c): c is string => !!c);
  const { data: links } = caminhos.length
    ? await supabase.storage.from("escola-documentos").createSignedUrls(caminhos, 600)
    : { data: [] };
  const linkDe = new Map((links ?? []).map((l) => [l.path, l.signedUrl]));

  return (
    <ul className="space-y-3">
      {documentos.map((d) => (
        <li key={d.id}>
          <Cartao>
            <div className="flex flex-wrap items-center gap-2">
              <Etiqueta>{rotuloTipoDocumento(d.tipo)}</Etiqueta>
              <span className="font-semibold">{d.titulo}</span>
              <span className="text-base">{formatarData(d.created_at)}</span>
            </div>
            {d.texto && <p className="mt-2 whitespace-pre-line">{d.texto}</p>}
            {d.arquivo && linkDe.get(d.arquivo) && (
              <a
                href={linkDe.get(d.arquivo)!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block underline underline-offset-4"
              >
                Abrir {d.arquivo_tipo === "application/pdf" ? "PDF" : "imagem"}
                {d.arquivo_nome ? ` (${d.arquivo_nome})` : ""}
              </a>
            )}
            {gerenciar && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-marca/10 pt-3">
                <form action={alterarCompartilhamentoDocumento.bind(null, d.id, "compartilhar_familia", !d.compartilhar_familia)}>
                  <button type="submit" className={BOTAO_DISCRETO} aria-pressed={d.compartilhar_familia}>
                    {d.compartilhar_familia ? "✓ Família vê" : "Família não vê"}
                  </button>
                </form>
                <form
                  action={alterarCompartilhamentoDocumento.bind(null, d.id, "compartilhar_especialistas", !d.compartilhar_especialistas)}
                >
                  <button type="submit" className={BOTAO_DISCRETO} aria-pressed={d.compartilhar_especialistas}>
                    {d.compartilhar_especialistas ? "✓ Especialistas veem" : "Especialistas não veem"}
                  </button>
                </form>
                <form action={apagarDocumentoEscola.bind(null, d.id)}>
                  <button type="submit" className={BOTAO_DISCRETO}>
                    Apagar
                  </button>
                </form>
              </div>
            )}
          </Cartao>
        </li>
      ))}
    </ul>
  );
}
