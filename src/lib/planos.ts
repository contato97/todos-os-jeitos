// Planos da Todos os Jeitos. Nomes, precos e limites ficam SO aqui: a pagina
// de planos e o checkout leem deste arquivo. Para mudar um preco, mude aqui.
// Proposta de 2026-11-10 (ver analise de mercado e de custo de IA).

export type IdPlano = "semente" | "caderno" | "lousa" | "mestre" | "escola";
export type Ciclo = "mensal" | "anual";

export type Plano = {
  id: IdPlano;
  nome: string;
  publico: string; // para quem e
  resumo: string;
  precoMensal: number | null; // null = gratis ou sob consulta
  sobConsulta?: boolean;
  destaque?: boolean;
  creditos?: number; // creditos de IA por mes (1 credito = ate 2 paginas)
  itens: string[];
};

// Anual: paga 10 meses e leva 12 ("2 meses gratis")
export const MESES_PAGOS_NO_ANUAL = 10;

export const PLANOS: Plano[] = [
  {
    id: "semente",
    nome: "Semente",
    publico: "Para conhecer",
    resumo: "Experimente com seus alunos, sem cartão.",
    precoMensal: 0,
    creditos: 5,
    itens: [
      "Até 3 alunos com perfil vivo",
      "5 créditos de adaptação por mês",
      "1 relatório por mês (família e técnico)",
      "Convite para a família, com 5 pedidos de reforço por mês",
      "Central de ajuda",
    ],
  },
  {
    id: "caderno",
    nome: "Caderno",
    publico: "Para famílias",
    resumo: "Apoio para o reforço e a lição de casa.",
    precoMensal: 19.9,
    itens: [
      "Até 2 filhos",
      "25 pedidos por mês à assistente de reforço",
      "Materiais prontos para imprimir",
      "Histórico, atividades e relatórios compartilhados pela escola",
      "Ficha “Como é em casa” para o professor",
    ],
  },
  {
    id: "lousa",
    nome: "Lousa",
    publico: "Para professores",
    resumo: "Tudo para adaptar e acompanhar a sua turma.",
    precoMensal: 39.9,
    destaque: true,
    creditos: 40,
    itens: [
      "Até 25 alunos com perfil vivo",
      "40 créditos de adaptação por mês",
      "8 relatórios por mês",
      "Baixar em Word, PDF ou imagem e copiar",
      "Convidar as famílias de todos os alunos",
      "Observações e histórico sem limite",
    ],
  },
  {
    id: "mestre",
    nome: "Mestre",
    publico: "Várias turmas ou AEE",
    resumo: "Para quem acompanha muitos alunos.",
    precoMensal: 79.9,
    creditos: 80,
    itens: [
      "Alunos sem limite",
      "80 créditos de adaptação por mês",
      "20 relatórios por mês",
      "Tudo do plano Lousa",
      "Suporte prioritário pelo WhatsApp",
    ],
  },
  {
    id: "escola",
    nome: "Escola",
    publico: "Para escolas e redes",
    resumo: "A inclusão da escola inteira em um só lugar.",
    precoMensal: null,
    sobConsulta: true,
    itens: [
      "Painel da gestão com professores e alunos",
      "Especialistas convidados, com permissões definidas pela escola",
      "Famílias conectadas, com consentimento (LGPD)",
      "Créditos de IA para toda a equipe",
      "Treinamento e acompanhamento da implantação",
    ],
  },
];

export function buscarPlano(id: string | null | undefined) {
  return PLANOS.find((p) => p.id === id);
}

export function precoDoCiclo(plano: Plano, ciclo: Ciclo) {
  if (plano.precoMensal == null) return null;
  return ciclo === "anual" ? plano.precoMensal * MESES_PAGOS_NO_ANUAL : plano.precoMensal;
}

export function formatarReais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export { linkWhatsapp } from "./contato";
