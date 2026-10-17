"use server";

// Acoes do professor. Toda escrita passa pelo RLS: mesmo que alguem forje um
// pedido com o id de outro aluno, o banco recusa.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ErroIA, perguntarIA } from "@/lib/ia/cliente";
import { mencionaDiagnostico, AVISO_DIAGNOSTICO } from "@/lib/ia/diagnostico";
import { SCHEMA_RELATORIO, SISTEMA_ADAPTAR, SISTEMA_RELATORIO, descreverPerfil } from "@/lib/ia/prompts";
import { lerCampo, type EstadoFormulario } from "@/lib/formulario";
import { criarClienteServidor } from "@/lib/supabase/server";

const CAMPOS_PERFIL = [
  "ano_escolar",
  "interesses",
  "pontos_fortes",
  "o_que_funciona",
  "o_que_trava",
  "comunicacao",
  "sensorial",
] as const;

const PDF_MAXIMO = 10 * 1024 * 1024;

// ---------------------------------------------------------------- Alunos

export async function salvarAluno(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const id = lerCampo(formData, "id");
  const nome = lerCampo(formData, "nome");
  const dataNascimento = lerCampo(formData, "data_nascimento");
  const saude = lerCampo(formData, "saude");
  const valores: Record<string, string> = { nome, data_nascimento: dataNascimento, saude };
  for (const c of CAMPOS_PERFIL) valores[c] = lerCampo(formData, c);

  if (!nome) return { erro: "Informe o nome do aluno.", valores };

  const dados: Record<string, string | null> = { nome, data_nascimento: dataNascimento || null };
  for (const c of CAMPOS_PERFIL) dados[c] = valores[c] || null;

  const supabase = await criarClienteServidor();
  let alunoId = id;
  if (id) {
    const { error } = await supabase.from("alunos").update(dados).eq("id", id);
    if (error) return { erro: "Não foi possível salvar o perfil.", valores };
  } else {
    const { data, error } = await supabase.from("alunos").insert(dados).select("id").single();
    if (error || !data) return { erro: "Não foi possível cadastrar o aluno.", valores };
    alunoId = data.id;
  }

  // Saude fica numa tabela separada, so do professor
  await supabase
    .from("alunos_saude")
    .upsert({ aluno_id: alunoId, informacoes: saude || null }, { onConflict: "aluno_id" });

  if (!id) redirect(`/professor/alunos/${alunoId}?novo=1`);
  refresh();
  return { sucesso: "Perfil atualizado.", valores };
}

export async function apagarAluno(alunoId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("alunos").delete().eq("id", alunoId);
  redirect("/professor/alunos");
}

// ---------------------------------------------------------------- Observacoes

export async function registrarObservacao(
  alunoId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const texto = lerCampo(formData, "texto");
  const data = lerCampo(formData, "data_observacao");
  const visivel = formData.get("visivel_familia") === "on";
  if (!texto) return { erro: "Escreva a observação." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("observacoes").insert({
    aluno_id: alunoId,
    origem: "escola",
    texto,
    visivel_familia: visivel,
    ...(data ? { data_observacao: data } : {}),
  });
  if (error) return { erro: "Não foi possível registrar a observação.", valores: { texto } };
  refresh();
  return { sucesso: "Observação registrada." };
}

export async function compartilharObservacao(observacaoId: string, visivel: boolean) {
  const supabase = await criarClienteServidor();
  await supabase.from("observacoes").update({ visivel_familia: visivel }).eq("id", observacaoId);
  refresh();
}

export async function apagarObservacao(observacaoId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("observacoes").delete().eq("id", observacaoId);
  refresh();
}

// ---------------------------------------------------------------- Atividades

export async function adaptarAtividade(
  alunoId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const titulo = lerCampo(formData, "titulo");
  const texto = lerCampo(formData, "texto");
  const arquivo = formData.get("arquivo");
  const temPdf = arquivo instanceof File && arquivo.size > 0;
  const valores = { titulo, texto };

  if (!titulo) return { erro: "Dê um título para a atividade.", valores };
  if (!texto && !temPdf) return { erro: "Cole o texto da atividade ou envie um PDF.", valores };
  if (temPdf && (arquivo.type !== "application/pdf" || arquivo.size > PDF_MAXIMO)) {
    return { erro: "Envie um arquivo PDF de até 10 MB.", valores };
  }

  const supabase = await criarClienteServidor();
  const { data: aluno } = await supabase.from("alunos").select("*").eq("id", alunoId).maybeSingle();
  if (!aluno) return { erro: "Aluno não encontrado.", valores };

  // Guarda o PDF original na pasta do professor (bucket privado)
  let caminho: string | null = null;
  let pdfBase64: string | null = null;
  if (temPdf) {
    const bytes = Buffer.from(await arquivo.arrayBuffer());
    pdfBase64 = bytes.toString("base64");
    caminho = `${aluno.professor_id}/${crypto.randomUUID()}.pdf`;
    const { error } = await supabase.storage.from("atividades").upload(caminho, bytes, { contentType: "application/pdf" });
    if (error) caminho = null;
  }

  let adaptado: string;
  try {
    adaptado = await perguntarIA({
      sistema: SISTEMA_ADAPTAR,
      conteudo: [
        ...(pdfBase64
          ? [{ type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: pdfBase64 } }]
          : []),
        {
          type: "text",
          text: `Perfil do aluno:\n${descreverPerfil(aluno)}\n\nTítulo da atividade: ${titulo}\n\n${
            texto ? `Atividade original:\n${texto}` : "A atividade original está no PDF anexado."
          }`,
        },
      ],
    });
  } catch (e) {
    return { erro: e instanceof ErroIA ? e.message : "Erro ao adaptar a atividade.", valores };
  }

  const { data: atividade, error } = await supabase
    .from("atividades")
    .insert({ aluno_id: alunoId, titulo, texto_original: texto || null, arquivo_original: caminho, conteudo_adaptado: adaptado })
    .select("id")
    .single();
  if (error || !atividade) return { erro: "Não foi possível salvar o rascunho.", valores };
  redirect(`/professor/alunos/${alunoId}/atividades/${atividade.id}`);
}

export async function salvarAtividade(
  atividadeId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const titulo = lerCampo(formData, "titulo");
  const conteudo = lerCampo(formData, "conteudo");
  const acao = lerCampo(formData, "acao"); // salvar | revisar | reabrir
  const compartilhar = formData.get("compartilhar") === "on";
  if (!titulo || !conteudo) return { erro: "Título e conteúdo não podem ficar vazios." };

  const status = acao === "revisar" ? "revisado" : acao === "reabrir" ? "rascunho" : lerCampo(formData, "status");
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("atividades")
    .update({
      titulo,
      conteudo_adaptado: conteudo,
      status,
      compartilhado_com_familia: status === "revisado" && compartilhar,
    })
    .eq("id", atividadeId);
  if (error) return { erro: "Não foi possível salvar." };
  refresh();
  return {
    sucesso: status === "revisado" ? "Atividade revisada. Agora ela pode ser exportada e compartilhada." : "Rascunho salvo.",
    aviso: mencionaDiagnostico(conteudo) ? AVISO_DIAGNOSTICO : undefined,
  };
}

export async function apagarAtividade(atividadeId: string, alunoId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("atividades").delete().eq("id", atividadeId);
  redirect(`/professor/alunos/${alunoId}/atividades`);
}

// ---------------------------------------------------------------- Relatorios

export async function gerarRelatorio(
  alunoId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const inicio = lerCampo(formData, "inicio");
  const fim = lerCampo(formData, "fim");
  const valores = { inicio, fim };
  if (!inicio || !fim || fim < inicio) return { erro: "Escolha um período válido.", valores };

  const supabase = await criarClienteServidor();
  const [{ data: aluno }, { data: observacoes }] = await Promise.all([
    supabase.from("alunos").select("*").eq("id", alunoId).maybeSingle(),
    supabase
      .from("observacoes")
      .select("texto, data_observacao, origem")
      .eq("aluno_id", alunoId)
      .gte("data_observacao", inicio)
      .lte("data_observacao", fim)
      .order("data_observacao"),
  ]);
  if (!aluno) return { erro: "Aluno não encontrado.", valores };

  const listaObs = observacoes?.length
    ? observacoes.map((o) => `- ${o.data_observacao} (${o.origem === "casa" ? "relato da família" : "escola"}): ${o.texto}`).join("\n")
    : "Nenhuma observação registrada neste período.";

  let resultado: { versao_familia: string; versao_tecnica: string };
  try {
    const json = await perguntarIA({
      sistema: SISTEMA_RELATORIO,
      formatoJson: SCHEMA_RELATORIO,
      conteudo: [
        {
          type: "text",
          text: `Período: ${inicio} a ${fim}\n\nPerfil do aluno:\n${descreverPerfil(aluno)}\n\nObservações do período:\n${listaObs}`,
        },
      ],
    });
    resultado = JSON.parse(json);
  } catch (e) {
    return { erro: e instanceof ErroIA ? e.message : "Erro ao gerar o relatório.", valores };
  }

  const { data: relatorio, error } = await supabase
    .from("relatorios")
    .insert({
      aluno_id: alunoId,
      periodo_inicio: inicio,
      periodo_fim: fim,
      versao_familia: resultado.versao_familia,
      versao_tecnica: resultado.versao_tecnica,
    })
    .select("id")
    .single();
  if (error || !relatorio) return { erro: "Não foi possível salvar o rascunho.", valores };
  redirect(`/professor/alunos/${alunoId}/relatorios/${relatorio.id}`);
}

export async function salvarRelatorio(
  relatorioId: string,
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const familia = lerCampo(formData, "versao_familia");
  const tecnica = lerCampo(formData, "versao_tecnica");
  const acao = lerCampo(formData, "acao");
  const compartilhar = formData.get("compartilhar") === "on";
  if (!familia || !tecnica) return { erro: "As duas versões precisam ter texto." };

  const status = acao === "revisar" ? "revisado" : acao === "reabrir" ? "rascunho" : lerCampo(formData, "status");
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("relatorios")
    .update({
      versao_familia: familia,
      versao_tecnica: tecnica,
      status,
      compartilhado_com_familia: status === "revisado" && compartilhar,
    })
    .eq("id", relatorioId);
  if (error) return { erro: "Não foi possível salvar." };
  refresh();
  return {
    sucesso: status === "revisado" ? "Relatório revisado. Agora ele pode ser exportado e compartilhado." : "Rascunho salvo.",
    aviso: mencionaDiagnostico(familia + tecnica) ? AVISO_DIAGNOSTICO : undefined,
  };
}

export async function apagarRelatorio(relatorioId: string, alunoId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("relatorios").delete().eq("id", relatorioId);
  redirect(`/professor/alunos/${alunoId}/relatorios`);
}

// ---------------------------------------------------------------- Familia

export async function removerFamilia(alunoId: string, familiaId: string) {
  const supabase = await criarClienteServidor();
  await supabase.from("aluno_familias").delete().eq("aluno_id", alunoId).eq("familia_id", familiaId);
  refresh();
}
