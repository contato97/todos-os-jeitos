// Opcoes fixas do cadastro. Os "valor" sao o que vai para o banco
// (precisam bater com os checks do SQL); os "rotulo" sao o que a pessoa le.

export const REDES = [
  { valor: "publica", rotulo: "Pública" },
  { valor: "privada", rotulo: "Privada" },
] as const;

export const ETAPAS = [
  { valor: "infantil", rotulo: "Educação Infantil" },
  { valor: "fundamental_1", rotulo: "Fundamental I (1º ao 5º ano)" },
  { valor: "fundamental_2", rotulo: "Fundamental II (6º ao 9º ano)" },
  { valor: "medio", rotulo: "Ensino Médio" },
] as const;

export const ATUACOES = [
  {
    valor: "polivalente",
    rotulo: "Base comum",
    descricao: "Dou aula de várias matérias para a mesma turma.",
  },
  {
    valor: "especialista",
    rotulo: "Uma matéria",
    descricao: "Dou aula de uma matéria específica, como Inglês ou Educação Física.",
  },
] as const;

export const CARGOS = [
  { valor: "direcao", rotulo: "Direção" },
  { valor: "coordenacao", rotulo: "Coordenação pedagógica" },
  { valor: "orientacao", rotulo: "Orientação educacional" },
  { valor: "outro", rotulo: "Outro" },
] as const;

// O que o professor pode pedir para a IA priorizar ao adaptar uma atividade
export const PRIORIDADES_ADAPTACAO = [
  { valor: "linguagem", rotulo: "Simplificar a linguagem", instrucao: "simplifique o vocabulário e use frases curtas" },
  { valor: "etapas", rotulo: "Dividir em etapas", instrucao: "divida cada questão em passos numerados" },
  { valor: "visual", rotulo: "Sugerir apoio visual", instrucao: "indique entre colchetes imagens, ícones ou esquemas que ajudam" },
  { valor: "interesses", rotulo: "Usar os interesses do aluno", instrucao: "use os interesses do aluno nos exemplos e enunciados" },
  { valor: "menos_questoes", rotulo: "Reduzir a quantidade", instrucao: "reduza o número de questões mantendo as essenciais para o objetivo" },
  { valor: "espaco", rotulo: "Mais espaço para responder", instrucao: "deixe linhas e espaços amplos para resposta" },
  { valor: "exemplo", rotulo: "Incluir exemplo resolvido", instrucao: "inclua um exemplo resolvido antes das questões" },
] as const;

// Confere se um valor recebido do formulario esta entre as opcoes permitidas
export function valorValido(opcoes: readonly { valor: string }[], valor: string) {
  return opcoes.some((o) => o.valor === valor);
}
