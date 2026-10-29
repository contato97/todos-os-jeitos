// Opcoes fixas do cadastro. Os "valor" sao o que vai para o banco
// (precisam bater com os checks do SQL); os "rotulo" sao o que a pessoa le.

export const REDES = [
  { valor: "publica", rotulo: "Pública" },
  { valor: "privada", rotulo: "Privada" },
  { valor: "ambas", rotulo: "As duas" },
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
  {
    valor: "ambos",
    rotulo: "As duas coisas",
    descricao: "Tenho turma de base comum e também dou aula de uma matéria específica.",
  },
] as const;

export const ROTULO_ATUACAO: Record<string, string> = {
  polivalente: "Base comum",
  especialista: "Uma matéria",
  ambos: "Base comum e uma matéria",
};

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

// Reforco em casa (area da familia)
export const TIPOS_REFORCO = [
  { valor: "reforco", rotulo: "Reforço de um conteúdo", descricao: "Uma atividade curta para praticar o que está sendo estudado." },
  { valor: "licao", rotulo: "Ajuda com a lição de casa", descricao: "Entender a lição para guiar, sem dar as respostas." },
  { valor: "explicar", rotulo: "Outras formas de explicar", descricao: "Jeitos diferentes de ensinar o mesmo conteúdo." },
  { valor: "material", rotulo: "Material pronto para imprimir", descricao: "Folha de atividade, jogo ou cartões para usar em casa." },
] as const;

export const MATERIAS = [
  "Português (leitura e escrita)",
  "Matemática",
  "Ciências",
  "História e Geografia",
  "Inglês",
  "Organização e rotina de estudos",
] as const;

export const TEMPOS_REFORCO = [10, 20, 30] as const;

export function rotuloTipoReforco(tipo: string) {
  return TIPOS_REFORCO.find((t) => t.valor === tipo)?.rotulo ?? "Reforço";
}

// Confere se um valor recebido do formulario esta entre as opcoes permitidas
export function valorValido(opcoes: readonly { valor: string }[], valor: string) {
  return opcoes.some((o) => o.valor === valor);
}

// Ficha "Como e em casa", preenchida pela familia. So os campos com ia: true
// ajudam a IA (sem nome). Saude e "outras" (que pode ter saude) nunca vao.
// Quem ve a ficha: so a familia e o professor do aluno.
export const CAMPOS_CASA = [
  {
    nome: "como_em_casa",
    rotulo: "Como ele(a) é em casa",
    dica: "Ex.: calmo de manhã e mais agitado à noite; adora ajudar na cozinha; não gosta de barulho alto.",
    ia: true,
  },
  {
    nome: "rotina_estudo",
    rotulo: "Como faz as tarefas em casa",
    dica: "Ex.: rende mais depois do lanche; precisa de pausas a cada 15 minutos; prefere fazer no chão da sala.",
    ia: true,
  },
  {
    nome: "medicacoes",
    rotulo: "Medicações",
    dica: "Quais, quantas vezes ao dia e em que horário. Se não usa, pode deixar em branco.",
    ia: false,
  },
  {
    nome: "acompanhamentos",
    rotulo: "Acompanhamentos",
    dica: "Ex.: neurologista, terapia ocupacional, fonoaudiologia, psicopedagogia. Com que frequência.",
    ia: false,
  },
  {
    nome: "outras",
    rotulo: "Outras informações importantes",
    dica: "Mudanças na família, sono, alimentação, algo que a escola precisa saber.",
    ia: false,
  },
] as const;

export type CampoCasa = (typeof CAMPOS_CASA)[number]["nome"];

// Especialista: profissao (o "quem e voce?" do cadastro). Precisa bater com o check do SQL.
export const PROFISSOES = [
  { valor: "psicologo", rotulo: "Psicólogo(a)" },
  { valor: "psicopedagogo", rotulo: "Psicopedagogo(a)" },
  { valor: "neuropsicopedagogo", rotulo: "Neuropsicopedagogo(a)" },
  { valor: "neuropsicologo", rotulo: "Neuropsicólogo(a)" },
  { valor: "terapeuta_ocupacional", rotulo: "Terapeuta ocupacional" },
  { valor: "fonoaudiologo", rotulo: "Fonoaudiólogo(a)" },
  { valor: "neuropediatra", rotulo: "Neuropediatra / neurologista" },
  { valor: "psiquiatra", rotulo: "Psiquiatra" },
  { valor: "fisioterapeuta", rotulo: "Fisioterapeuta" },
  { valor: "outro", rotulo: "Outra especialidade" },
] as const;

export function rotuloProfissao(valor: string | null | undefined) {
  return PROFISSOES.find((p) => p.valor === valor)?.rotulo ?? "Especialista";
}

// Registros do especialista sobre o aluno
export const TIPOS_REGISTRO_ESPECIALISTA = [
  {
    valor: "orientacao",
    rotulo: "Orientação",
    descricao: "Estratégias e observações para a escola e a família. Professor, família e coordenação veem.",
  },
  {
    valor: "clinico",
    rotulo: "Informação clínica",
    descricao: "Medicação, receitas, informações de saúde. Só o professor do aluno e a família veem (a coordenação não).",
  },
] as const;
