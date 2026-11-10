import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { criarClienteServidor } from "@/lib/supabase/server";
import { custoEmDolar } from "./precos";

export type AcaoIA = "adaptar" | "relatorio" | "reforco" | "moderacao" | "encaminhamento";

export type RegistroUso = { acao: AcaoIA; paginas: number; creditos: number };

// Guarda os numeros de uma chamada a IA (tokens e custo), nunca o texto.
// Se o registro falhar, o professor recebe a resposta mesmo assim: so avisamos no log.
export async function registrarUso(registro: RegistroUso, resposta: Anthropic.Beta.BetaMessage, sucesso: boolean) {
  const u = resposta.usage;
  const uso = {
    entrada: u.input_tokens ?? 0,
    saida: u.output_tokens ?? 0,
    cacheLeitura: u.cache_read_input_tokens ?? 0,
    cacheEscrita: u.cache_creation_input_tokens ?? 0,
  };
  try {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.from("ia_uso").insert({
      acao: registro.acao,
      // resposta.model: se a IA principal recusar, quem respondeu foi o modelo alternativo
      modelo: resposta.model,
      sucesso,
      paginas: Math.min(registro.paginas, 1000),
      // Pedido que nao deu certo nao gasta credito da pessoa
      creditos: sucesso ? registro.creditos : 0,
      tokens_entrada: uso.entrada,
      tokens_saida: uso.saida,
      tokens_cache_leitura: uso.cacheLeitura,
      tokens_cache_escrita: uso.cacheEscrita,
      custo_usd: custoEmDolar(resposta.model, uso),
    });
    if (error) console.error("[ia] nao foi possivel registrar o uso:", error.message);
  } catch (erro) {
    console.error("[ia] nao foi possivel registrar o uso:", erro);
  }
}

// Creditos gastos pelo usuario logado no mes atual (horario de Brasilia)
export async function creditosUsadosNoMes() {
  const supabase = await criarClienteServidor();
  const agora = new Date(Date.now() - 3 * 3600 * 1000);
  const inicio = `${agora.toISOString().slice(0, 7)}-01T00:00:00-03:00`;
  const { data } = await supabase.from("ia_uso").select("creditos").gte("created_at", inicio);
  return (data ?? []).reduce((total, r) => total + (r.creditos ?? 0), 0);
}
