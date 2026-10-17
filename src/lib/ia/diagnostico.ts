// Segunda barreira contra diagnosticos: alem da instrucao dada a IA, conferimos
// o texto final. Se aparecer um termo de diagnostico, o professor ve um aviso
// para revisar com atencao (o texto nao e bloqueado: pode ser uma citacao legitima).
const TERMOS = [
  /\btdah\b/i,
  /\btea\b/i,
  /autis/i,
  /espectro autista/i,
  /dislexi/i,
  /discalculi/i,
  /disgrafi/i,
  /\btod\b/i,
  /\btoc\b/i,
  /d[ée]ficit de aten[çc][ãa]o/i,
  /transtorno/i,
  /s[íi]ndrome/i,
  /diagn[óo]stic/i,
  /suspeita de/i,
  /pode ter (um|uma)/i,
];

export function mencionaDiagnostico(texto: string | null | undefined) {
  return Boolean(texto && TERMOS.some((t) => t.test(texto)));
}

export const AVISO_DIAGNOSTICO =
  "Este texto menciona termos ligados a diagnóstico. Revise com atenção: a plataforma não sugere diagnósticos, isso é papel dos profissionais de saúde.";
