import { Cartao } from "@/components/ui";
import { buscarUsuario } from "@/lib/auth";
import { urlDaFoto } from "@/lib/foto";
import { criarClienteServidor } from "@/lib/supabase/server";
import {
  FormularioDados,
  FormularioEmail,
  FormularioFoto,
  FormularioSenha,
} from "./conta-formularios";

// Pagina "Minha conta", igual para os tres perfis (os campos mudam conforme o tipo)
export async function MinhaConta() {
  const usuario = await buscarUsuario();
  if (!usuario) return null;
  const supabase = await criarClienteServidor();

  const [{ data: claims }, foto, { data: professor }, { data: escola }, { data: especialista }, { data: whatsapp }] =
    await Promise.all([
      supabase.auth.getClaims(),
      urlDaFoto(usuario.foto),
      usuario.tipo === "professor"
        ? supabase
            .from("professores")
            .select("escola_nome, rede, etapas, atuacao")
            .eq("id", usuario.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      usuario.tipo === "escola"
        ? supabase
            .from("escolas")
            .select("nome, cargo_responsavel")
            .eq("responsavel_id", usuario.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      usuario.tipo === "especialista"
        ? supabase
            .from("especialistas")
            .select("profissao, registro, clinica, local, atuacao")
            .eq("id", usuario.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      // O telefone so e lido pelo proprio dono (ver migration whatsapp_privado)
      supabase.rpc("meu_whatsapp"),
    ]);
  const email = (claims?.claims?.email as string | undefined) ?? "";

  return (
    <>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-semibold">Minha conta</h1>
        <p className="mt-1">Sua foto, seus dados e o acesso à plataforma.</p>
        <div className="mt-6 flex flex-col gap-6">
          <Cartao>
            <h2 className="mb-4 text-xl font-semibold">Foto de perfil</h2>
            <FormularioFoto urlAtual={foto} nome={usuario.nome} />
          </Cartao>
          <Cartao>
            <h2 className="mb-4 text-xl font-semibold">Meus dados</h2>
            <FormularioDados
              dados={{
                tipo: usuario.tipo,
                nome: usuario.nome,
                whatsapp,
                escola: professor?.escola_nome ?? escola?.nome,
                rede: professor?.rede,
                etapas: professor?.etapas,
                atuacao: professor?.atuacao,
                cargo: escola?.cargo_responsavel,
                profissao: especialista?.profissao,
                registro: especialista?.registro,
                clinica: especialista?.clinica,
                local: especialista?.local,
                atuacaoEspecialista: especialista?.atuacao,
              }}
            />
          </Cartao>
          <Cartao>
            <h2 className="mb-4 text-xl font-semibold">E-mail de acesso</h2>
            <FormularioEmail emailAtual={email} />
          </Cartao>
          <Cartao>
            <h2 className="mb-4 text-xl font-semibold">Senha</h2>
            <FormularioSenha />
          </Cartao>
          <Cartao>
            <h2 className="text-xl font-semibold">Seus dados e a LGPD</h2>
            <p className="mt-2">
              Para pedir uma cópia dos seus dados ou a exclusão da conta, fale
              com a gente pelo{" "}
              <a
                href="https://wa.me/5511971261699"
                className="underline underline-offset-4"
              >
                WhatsApp
              </a>
              .
            </p>
          </Cartao>
        </div>
      </div>
    </>
  );
}
