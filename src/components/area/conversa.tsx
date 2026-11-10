import { Cartao, Etiqueta, Vazio, formatarData } from "@/components/ui";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioMensagem } from "./formulario-mensagem";

// Conversa de um aluno: professor e familias conectadas. Mostra os recados em
// ordem e marca a conversa como lida para quem esta vendo.
export async function Conversa({ alunoId, papel }: { alunoId: string; papel: "professor" | "familia" }) {
  const usuario = await buscarUsuario();
  const supabase = await criarClienteServidor();
  const [{ data: mensagens }] = await Promise.all([
    supabase
      .from("mensagens")
      .select("id, texto, autor_id, created_at, perfis(nome, tipo)")
      .eq("aluno_id", alunoId)
      .order("created_at")
      .limit(200),
    supabase.rpc("marcar_conversa_lida", { p_aluno: alunoId }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section aria-labelledby="titulo-conversa" className="min-w-0 lg:col-span-3">
        <h2 id="titulo-conversa" className="mb-3 text-xl font-semibold">
          Conversa
        </h2>
        {!mensagens?.length ? (
          <Vazio>
            {papel === "professor"
              ? "Nenhum recado ainda. Escreva para a família ao lado."
              : "Nenhum recado ainda. Escreva para o professor ao lado."}
          </Vazio>
        ) : (
          <ol className="flex flex-col gap-3" aria-label="Recados, do mais antigo para o mais novo">
            {mensagens.map((m) => {
              const autor = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis;
              const meu = m.autor_id === usuario?.id;
              return (
                <li key={m.id} className={`max-w-[85%] ${meu ? "self-end" : "self-start"}`}>
                  <div
                    className={`rounded-2xl p-4 ${meu ? "bg-petroleo/15" : "bg-white/80 ring-1 ring-marca/10"}`}
                  >
                    <p className="flex flex-wrap items-center gap-2 text-base">
                      <span className="font-semibold">{meu ? "Você" : (autor?.nome ?? "Participante")}</span>
                      {!meu && autor?.tipo && (
                        <Etiqueta tipo={autor.tipo === "familia" ? "casa" : "compartilhado"}>
                          {autor.tipo === "familia" ? "Família" : "Professor(a)"}
                        </Etiqueta>
                      )}
                      <span>{formatarData(m.created_at, true)}</span>
                    </p>
                    <p className="mt-1 whitespace-pre-line">{m.texto}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="min-w-0 lg:col-span-2">
        <Cartao>
          <h2 className="text-xl font-semibold">
            {papel === "professor" ? "Escrever para a família" : "Escrever para o professor"}
          </h2>
          <p className="mb-4 mt-1 text-base">
            Antes de sair, todo recado passa por uma revisão automática, para a conversa ser sempre respeitosa dos dois
            lados.
          </p>
          <FormularioMensagem
            alunoId={alunoId}
            dica={
              papel === "professor"
                ? "Ex.: hoje ele leu a frase inteira sozinho! Vale elogiar em casa."
                : "Ex.: ele dormiu mal esta noite e pode estar mais cansado hoje."
            }
          />
        </Cartao>
      </div>
    </div>
  );
}
