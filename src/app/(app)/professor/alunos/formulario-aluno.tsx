"use client";

import { useActionState, useState } from "react";
import { AreaTexto, Aviso, BotaoEnviar, Campo } from "@/components/formulario";
import { CampoDocumentos } from "@/components/area/campo-documentos";
import { salvarAluno } from "../acoes";

export type DadosAluno = Partial<
  Record<
    | "id"
    | "nome"
    | "data_nascimento"
    | "ano_escolar"
    | "interesses"
    | "pontos_fortes"
    | "o_que_funciona"
    | "o_que_trava"
    | "comunicacao"
    | "sensorial"
    | "saude",
    string | null
  >
>;

// As etapas do cadastro. Cada uma mostra poucas perguntas por vez,
// para o formulario nao parecer enorme.
const ETAPAS = [
  { titulo: "Quem é o aluno", descricao: "O básico para identificar." },
  { titulo: "Como aprende", descricao: "O coração do perfil vivo: escreva com exemplos do dia a dia." },
  { titulo: "Comunicação e sentidos", descricao: "Como receber instruções e o que incomoda no ambiente." },
  { titulo: "Saúde (opcional)", descricao: "Só você vê, inclusive os documentos anexados. Nada daqui é enviado para a IA." },
];

export function FormularioAluno({ aluno, modo }: { aluno?: DadosAluno; modo: "novo" | "editar" }) {
  const [estado, acao] = useActionState(salvarAluno, {});
  const [etapa, setEtapa] = useState(0);
  const [erroEtapa, setErroEtapa] = useState("");
  // Depois de um erro do servidor, mostra o que a pessoa digitou; senao, o que veio do banco
  const v = (campo: keyof DadosAluno) => estado.valores?.[campo] ?? aluno?.[campo] ?? "";
  const emEtapas = modo === "novo";
  const visivel = (i: number) => !emEtapas || etapa === i;

  function avancar() {
    const nome = (document.querySelector<HTMLInputElement>("input[name=nome]")?.value ?? "").trim();
    if (etapa === 0 && !nome) {
      setErroEtapa("Informe o nome do aluno para continuar.");
      return;
    }
    setErroEtapa("");
    setEtapa(etapa + 1);
  }

  return (
    <form action={acao} className="flex flex-col gap-6">
      {aluno?.id && <input type="hidden" name="id" value={aluno.id} />}

      {emEtapas && (
        <ol className="flex flex-wrap gap-2" aria-label="Etapas do cadastro">
          {ETAPAS.map((e, i) => (
            <li
              key={e.titulo}
              aria-current={i === etapa ? "step" : undefined}
              className={`rounded-full px-3 py-1 text-base ${
                i === etapa ? "bg-marca text-creme" : i < etapa ? "bg-salvia/25" : "bg-marca/5"
              }`}
            >
              {i + 1}. {e.titulo}
            </li>
          ))}
        </ol>
      )}

      {estado.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}
      {erroEtapa && <Aviso tipo="erro">{erroEtapa}</Aviso>}

      {/* As etapas escondidas continuam dentro do formulario (atributo hidden):
          o que foi digitado nelas e enviado junto no final */}
      <fieldset hidden={!visivel(0)} className="flex flex-col gap-5">
        <legend className="mb-1 text-xl font-semibold">{ETAPAS[0].titulo}</legend>
        <Campo rotulo="Nome do aluno" name="nome" required defaultValue={v("nome")} autoComplete="off" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo rotulo="Data de nascimento (opcional)" name="data_nascimento" type="date" defaultValue={v("data_nascimento")} />
          <Campo rotulo="Ano / turma" name="ano_escolar" defaultValue={v("ano_escolar")} placeholder="Ex.: 3º ano B" />
        </div>
      </fieldset>

      <fieldset hidden={!visivel(1)} className="flex flex-col gap-5">
        <legend className="mb-1 text-xl font-semibold">{ETAPAS[1].titulo}</legend>
        <p>{ETAPAS[1].descricao}</p>
        <AreaTexto rotulo="Interesses" name="interesses" defaultValue={v("interesses")} rows={2}
          dica="Assuntos, personagens, atividades que despertam a atenção. Ex.: dinossauros, futebol, desenhar." />
        <AreaTexto rotulo="Pontos fortes" name="pontos_fortes" defaultValue={v("pontos_fortes")} rows={2}
          dica="O que ele faz bem. Ex.: memória visual, criatividade, ajuda os colegas." />
        <AreaTexto rotulo="O que funciona" name="o_que_funciona" defaultValue={v("o_que_funciona")} rows={3}
          dica="Estratégias que ajudam. Ex.: instruções curtas, uma de cada vez; apoio de imagens." />
        <AreaTexto rotulo="O que trava" name="o_que_trava" defaultValue={v("o_que_trava")} rows={3}
          dica="Situações que dificultam. Ex.: textos longos sem imagens, barulho, mudança de rotina sem aviso." />
      </fieldset>

      <fieldset hidden={!visivel(2)} className="flex flex-col gap-5">
        <legend className="mb-1 text-xl font-semibold">{ETAPAS[2].titulo}</legend>
        <AreaTexto rotulo="Como prefere receber instruções" name="comunicacao" defaultValue={v("comunicacao")} rows={2}
          dica="Ex.: falar olhando nos olhos, mostrar um exemplo antes, lista escrita no quadro." />
        <AreaTexto rotulo="Sensibilidades sensoriais" name="sensorial" defaultValue={v("sensorial")} rows={2}
          dica="Ex.: incomoda-se com barulho, prefere sentar perto da janela, precisa de pausas para se movimentar." />
      </fieldset>

      <fieldset hidden={!visivel(3)} className="flex flex-col gap-5">
        <legend className="mb-1 text-xl font-semibold">{ETAPAS[3].titulo}</legend>
        <p>{ETAPAS[3].descricao}</p>
        <AreaTexto rotulo="Informações de saúde informadas pela família" name="saude" defaultValue={v("saude")} rows={3}
          dica="Só registre o que a família compartilhou (por exemplo, um laudo). Nunca suposições." />
        {/* Na edicao, os documentos ficam na pagina do aluno (com lista e opcao de apagar) */}
        {emEtapas && <CampoDocumentos />}
      </fieldset>

      <div className="flex flex-wrap gap-3">
        {emEtapas ? (
          <>
            {etapa > 0 && (
              <button type="button" onClick={() => setEtapa(etapa - 1)} className="rounded-full px-6 py-3 font-medium ring-2 ring-marca">
                Voltar
              </button>
            )}
            {etapa < ETAPAS.length - 1 ? (
              <button type="button" onClick={avancar} className="rounded-full bg-marca px-6 py-3 font-medium text-creme hover:bg-petroleo">
                Continuar
              </button>
            ) : (
              <BotaoEnviar enviando="Salvando...">Cadastrar aluno</BotaoEnviar>
            )}
          </>
        ) : (
          <BotaoEnviar enviando="Salvando...">Salvar perfil</BotaoEnviar>
        )}
      </div>
      {emEtapas && etapa > 0 && etapa < ETAPAS.length - 1 && (
        <p className="text-base">Pode pular o que não souber agora: o perfil é vivo e você completa depois.</p>
      )}
    </form>
  );
}
