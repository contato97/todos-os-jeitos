import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Aviso } from "@/components/formulario";
import { BOTAO, BOTAO_SECUNDARIO } from "@/components/ui";
import { buscarUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";
import { BotaoAceitar, CadastroEspecialista, CadastroFamilia } from "./formularios";

export const metadata: Metadata = { title: "Convite | Todos os Jeitos" };

type TipoConvite = "familia" | "professor" | "especialista";
type Convite = { tipo: TipoConvite; valido: boolean; email_dica: string; aluno_primeiro_nome: string | null; escola_nome: string | null };

const TEXTO: Record<TipoConvite, string> = {
  familia:
    "Na Todos os Jeitos você acompanha o que a escola compartilhar, conta como foi em casa e recebe apoio para o reforço e a lição de casa.",
  professor:
    "Ao aceitar, a coordenação passa a acompanhar seus alunos e o que você já revisou, só para leitura. Informações de saúde e anotações do dia a dia continuam só com você.",
  especialista:
    "A Todos os Jeitos conecta escola, família e especialistas. A escola escolhe quais alunos você acompanha: você consulta os relatórios revisados e registra orientações para quem está com a criança todos os dias.",
};
const NOME_TIPO: Record<TipoConvite, string> = { familia: "família", professor: "professor", especialista: "especialista" };

export default function PaginaConvite({ params }: PageProps<"/convite/[token]">) {
  return (
    <Suspense fallback={<p>Carregando convite...</p>}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await criarClienteServidor();
  // Tokens malformados nem chegam ao banco
  const formatoOk = /^[0-9a-f-]{36}$/i.test(token);
  const { data } = formatoOk ? await supabase.rpc("ver_convite", { p_token: token }) : { data: null };
  const convite = (data as Convite[] | null)?.[0];

  if (!convite || !convite.valido) {
    return (
      <>
        <h1 className="text-3xl font-semibold">Convite indisponível</h1>
        <p className="mt-4">Este convite já foi usado, expirou ou não existe. Peça um novo a quem convidou você.</p>
        <Link href="/login" className={`${BOTAO} mt-6`}>
          Ir para o login
        </Link>
      </>
    );
  }

  const usuario = await buscarUsuario();
  const tipo = convite.tipo;
  const titulo =
    tipo === "familia" ? `Convite para acompanhar ${convite.aluno_primeiro_nome}` : `${convite.escola_nome} convidou você`;
  const voltar = `/convite/${token}`;
  const linkEntrar = `/login?proximo=${encodeURIComponent(voltar)}`;

  return (
    <>
      <h1 className="text-3xl font-semibold">{titulo}</h1>
      <p className="mt-3">{TEXTO[tipo]}</p>
      <p className="mt-2 text-base">Convite enviado para {convite.email_dica}.</p>

      <div className="mt-8">
        {usuario ? (
          usuario.tipo === tipo ? (
            <BotaoAceitar token={token} />
          ) : (
            <Aviso tipo="erro">
              Você está conectado(a) como {usuario.tipo}. Este convite é para {NOME_TIPO[tipo]}: saia e entre com o e-mail
              que recebeu o convite.
            </Aviso>
          )
        ) : tipo === "professor" ? (
          <div className="flex flex-col gap-3">
            <Link href={linkEntrar} className={BOTAO}>
              Já tenho conta: entrar
            </Link>
            <Link href={`/cadastro?proximo=${encodeURIComponent(voltar)}`} className={BOTAO_SECUNDARIO}>
              Criar conta de professor
            </Link>
          </div>
        ) : (
          <>
            {tipo === "familia" ? (
              <CadastroFamilia token={token} emailDica={convite.email_dica} />
            ) : (
              <CadastroEspecialista token={token} emailDica={convite.email_dica} />
            )}
            <p className="mt-6 text-center">
              Já tem conta?{" "}
              <Link href={linkEntrar} className="font-medium underline underline-offset-4">
                Entrar e aceitar
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );
}
