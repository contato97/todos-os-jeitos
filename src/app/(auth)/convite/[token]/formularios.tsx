"use client";

import { useActionState } from "react";
import { Aviso, BotaoEnviar, Campo, CampoSenha, CampoWhatsapp } from "@/components/formulario";
import { PROFISSOES } from "@/lib/opcoes-cadastro";
import { aceitarConvite, cadastrarEspecialista, cadastrarFamilia } from "../acoes";
import { SENHA_MINIMA } from "../../mensagens";

export function BotaoAceitar({ token }: { token: string }) {
  const [estado, acao] = useActionState(aceitarConvite.bind(null, token), {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <BotaoEnviar enviando="Aceitando...">Aceitar convite</BotaoEnviar>
    </form>
  );
}

export function CadastroFamilia({ token, emailDica }: { token: string; emailDica: string }) {
  const [estado, acao] = useActionState(cadastrarFamilia.bind(null, token), {});
  if (estado.sucesso) return <Aviso tipo="sucesso">{estado.sucesso}</Aviso>;

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <Campo rotulo="Seu nome" name="nome" autoComplete="name" required defaultValue={estado.valores?.nome} />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={estado.valores?.email}
        dica={`Use o e-mail que recebeu o convite (${emailDica}).`}
      />
      <CampoWhatsapp defaultValue={estado.valores?.whatsapp} />
      <CampoSenha rotulo="Crie uma senha" name="senha" autoComplete="new-password" required minLength={SENHA_MINIMA} dica={`Pelo menos ${SENHA_MINIMA} caracteres.`} />
      <BotaoEnviar enviando="Criando conta...">Criar minha conta</BotaoEnviar>
    </form>
  );
}

export function CadastroEspecialista({ token, emailDica }: { token: string; emailDica: string }) {
  const [estado, acao] = useActionState(cadastrarEspecialista.bind(null, token), {});
  if (estado.sucesso) return <Aviso tipo="sucesso">{estado.sucesso}</Aviso>;
  const v = estado.valores ?? {};

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="profissao" className="font-medium">
          Quem é você? Sou especialista em...
        </label>
        <select
          id="profissao"
          name="profissao"
          required
          defaultValue={v.profissao ?? ""}
          className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca focus:border-petroleo"
        >
          <option value="" disabled>
            Selecione
          </option>
          {PROFISSOES.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.rotulo}
            </option>
          ))}
        </select>
      </div>
      <Campo rotulo="Seu nome" name="nome" autoComplete="name" required defaultValue={v.nome} />
      <Campo
        rotulo="Registro profissional (opcional)"
        name="registro"
        maxLength={60}
        defaultValue={v.registro}
        dica="CRM, CRP, CREFITO, CRFa... quando houver."
      />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={v.email}
        dica={`Use o e-mail que recebeu o convite (${emailDica}).`}
      />
      <CampoWhatsapp defaultValue={v.whatsapp} />
      <Campo rotulo="Nome da clínica ou consultório" name="clinica" required maxLength={160} defaultValue={v.clinica} />
      <Campo
        rotulo="Onde fica"
        name="local"
        required
        maxLength={160}
        defaultValue={v.local}
        dica="Cidade e bairro, ou o endereço. Ex.: São Paulo, Vila Mariana."
      />
      <Campo
        rotulo="Como você atua?"
        name="atuacao"
        required
        maxLength={300}
        defaultValue={v.atuacao}
        dica="Ex.: terapia ocupacional com crianças de 4 a 10 anos; neuropsicopedagogia clínica."
      />
      <CampoSenha rotulo="Crie uma senha" name="senha" autoComplete="new-password" required minLength={SENHA_MINIMA} dica={`Pelo menos ${SENHA_MINIMA} caracteres.`} />
      <BotaoEnviar enviando="Criando conta...">Criar minha conta</BotaoEnviar>
    </form>
  );
}
