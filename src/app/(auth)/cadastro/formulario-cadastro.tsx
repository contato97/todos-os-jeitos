"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { Aviso, BotaoEnviar, Campo, CampoSenha } from "@/components/formulario";
import { ATUACOES, CARGOS, ETAPAS, REDES } from "@/lib/opcoes-cadastro";
import { cadastrar } from "../actions";
import { SENHA_MINIMA, type EstadoFormulario } from "../mensagens";

const TIPOS = [
  { valor: "professor", titulo: "Sou professor(a)", texto: "Para adaptar atividades e acompanhar meus alunos." },
  { valor: "escola", titulo: "Sou uma escola", texto: "Para a gestão acompanhar os professores." },
] as const;

// has-checked: o cartao muda de cor quando o radio dentro dele esta marcado (so CSS)
const ESTILO_OPCAO =
  "flex cursor-pointer gap-3 rounded-2xl border-2 border-marca/15 p-4 has-checked:border-petroleo has-checked:bg-petroleo/5";

export function FormularioCadastro() {
  const [estado, acao] = useActionState(cadastrar, {});
  const [tipo, setTipo] = useState<string>("professor");
  const proximo = useSearchParams().get("proximo");

  if (estado.sucesso) {
    return <Aviso tipo="sucesso">{estado.sucesso}</Aviso>;
  }

  return (
    <form action={acao} className="flex flex-col gap-6">
      {proximo && <input type="hidden" name="proximo" value={proximo} />}
      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}

      {/* fieldset + legend agrupam as opcoes: o leitor de tela anuncia a pergunta */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-medium">Quem é você?</legend>
        {TIPOS.map((opcao) => (
          <label key={opcao.valor} className={ESTILO_OPCAO}>
            <input
              type="radio"
              name="tipo"
              value={opcao.valor}
              checked={tipo === opcao.valor}
              onChange={() => setTipo(opcao.valor)}
              className="mt-1.5 size-5 shrink-0 accent-petroleo"
            />
            <span>
              <span className="block font-semibold">{opcao.titulo}</span>
              <span className="block text-base">{opcao.texto}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {tipo === "professor" ? <CamposProfessor estado={estado} /> : <CamposEscola estado={estado} />}

      <CampoSenha
        rotulo="Senha"
        name="senha"
        autoComplete="new-password"
        required
        minLength={SENHA_MINIMA}
        dica={`Use pelo menos ${SENHA_MINIMA} caracteres.`}
      />

      <BotaoEnviar enviando="Criando conta...">Criar conta</BotaoEnviar>
    </form>
  );
}

function CamposProfessor({ estado }: { estado: EstadoFormulario }) {
  const v = estado.valores ?? {};
  const etapasMarcadas = v.etapas?.split(",") ?? [];

  return (
    <>
      <Campo rotulo="Seu nome" name="nome" autoComplete="name" required defaultValue={v.nome} />
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required defaultValue={v.email} />
      <Campo
        rotulo="Nome da escola"
        name="escola"
        autoComplete="organization"
        required
        defaultValue={v.escola}
        dica="Se trabalha em mais de uma, informe a principal."
      />

      <fieldset>
        <legend className="mb-2 font-medium">A escola é</legend>
        <div className="flex gap-3">
          {REDES.map((r) => (
            <label key={r.valor} className={`${ESTILO_OPCAO} flex-1 items-center`}>
              <input
                type="radio"
                name="rede"
                value={r.valor}
                required
                defaultChecked={v.rede === r.valor}
                className="size-5 accent-petroleo"
              />
              {r.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-medium">Em quais etapas você leciona?</legend>
        <p className="mb-2 text-base">Pode marcar mais de uma.</p>
        <div className="flex flex-col gap-2">
          {ETAPAS.map((e) => (
            <label key={e.valor} className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-1.5">
              <input
                type="checkbox"
                name="etapas"
                value={e.valor}
                defaultChecked={etapasMarcadas.includes(e.valor)}
                className="size-5 accent-petroleo"
              />
              {e.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-medium">Como você atua?</legend>
        {ATUACOES.map((a) => (
          <label key={a.valor} className={ESTILO_OPCAO}>
            <input
              type="radio"
              name="atuacao"
              value={a.valor}
              required
              defaultChecked={v.atuacao === a.valor}
              className="mt-1.5 size-5 shrink-0 accent-petroleo"
            />
            <span>
              <span className="block font-semibold">{a.rotulo}</span>
              <span className="block text-base">{a.descricao}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </>
  );
}

function CamposEscola({ estado }: { estado: EstadoFormulario }) {
  const v = estado.valores ?? {};

  return (
    <>
      <Campo rotulo="Nome da escola" name="escola" autoComplete="organization" required defaultValue={v.escola} />
      <Campo rotulo="Responsável pela conta" name="nome" autoComplete="name" required defaultValue={v.nome} />

      <div className="flex flex-col gap-1">
        <label htmlFor="cargo" className="font-medium">
          Cargo
        </label>
        <select
          id="cargo"
          name="cargo"
          required
          defaultValue={v.cargo ?? ""}
          className="rounded-xl border-2 border-marca/25 bg-white px-4 py-3 text-marca focus:border-petroleo"
        >
          <option value="" disabled>
            Selecione
          </option>
          {CARGOS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.rotulo}
            </option>
          ))}
        </select>
      </div>

      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required defaultValue={v.email} />
    </>
  );
}
