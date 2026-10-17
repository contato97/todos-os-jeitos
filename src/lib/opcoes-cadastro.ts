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

// Confere se um valor recebido do formulario esta entre as opcoes permitidas
export function valorValido(opcoes: readonly { valor: string }[], valor: string) {
  return opcoes.some((o) => o.valor === valor);
}
