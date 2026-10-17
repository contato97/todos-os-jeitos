// Modelos dos e-mails de boas-vindas, um por perfil.
// E-mail nao aceita CSS moderno: por isso o layout usa tabelas e estilos "inline"
// (dentro de cada tag), que funcionam no Gmail, Outlook e celular.

export type Email = { assunto: string; html: string; texto: string };

const COR = { marca: "#0E4357", creme: "#FCF5E6", petroleo: "#12708A", mostarda: "#EAA632" };
const WHATSAPP = "https://wa.me/5511971261699";

// Escapa caracteres especiais: o nome digitado pela pessoa nunca vira codigo HTML
function seguro(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

type Conteudo = {
  site: string;
  saudacao: string;
  paragrafos: string[];
  tituloLista?: string;
  lista: string[];
  listaNumerada?: boolean;
  destaque: string;
  botao: { texto: string; href: string };
};

function montar({ site, saudacao, paragrafos, tituloLista, lista, listaNumerada, destaque, botao }: Conteudo) {
  const tagLista = listaNumerada ? "ol" : "ul";
  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:${COR.creme};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COR.creme};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;">
    <tr><td style="padding:32px 32px 8px;">
      <img src="${site}/logo.png" alt="Todos os Jeitos" width="160" style="display:block;width:160px;height:auto;">
    </td></tr>
    <tr><td style="padding:16px 32px 32px;font-family:Lexend,Arial,sans-serif;font-size:17px;line-height:1.6;color:${COR.marca};">
      <p style="margin:0 0 16px;font-size:22px;font-weight:600;">${saudacao}</p>
      ${paragrafos.map((p) => `<p style="margin:0 0 16px;">${p}</p>`).join("\n      ")}
      ${tituloLista ? `<p style="margin:24px 0 8px;font-weight:600;">${tituloLista}</p>` : ""}
      <${tagLista} style="margin:0 0 24px;padding-left:22px;">
        ${lista.map((item) => `<li style="margin:0 0 8px;">${item}</li>`).join("\n        ")}
      </${tagLista}>
      <p style="margin:0 0 28px;padding:16px;border-left:4px solid ${COR.mostarda};background:${COR.creme};border-radius:8px;">${destaque}</p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:${COR.marca};">
        <a href="${botao.href}" style="display:inline-block;padding:14px 28px;font-weight:600;color:${COR.creme};text-decoration:none;">${botao.texto}</a>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:20px 32px;border-top:1px solid #e8e2d4;font-family:Lexend,Arial,sans-serif;font-size:14px;line-height:1.5;color:${COR.marca};">
      Dúvidas? <a href="${WHATSAPP}" style="color:${COR.petroleo};">Fale com a gente no WhatsApp</a>.<br>
      Todos os Jeitos · Cada aluno aprende do seu jeito.
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  // Versao so texto: alguns leitores de e-mail e filtros de spam preferem
  const semTags = (t: string) => t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");
  const texto = [
    semTags(saudacao),
    ...paragrafos.map(semTags),
    tituloLista ? semTags(tituloLista) : "",
    ...lista.map((item, i) => `${listaNumerada ? `${i + 1}.` : "-"} ${semTags(item)}`),
    semTags(destaque),
    `${botao.texto}: ${botao.href}`,
    `Dúvidas? Fale com a gente no WhatsApp: ${WHATSAPP}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { html, texto };
}

export function boasVindasProfessor({ nome, site }: { nome: string; site: string }): Email {
  const n = seguro(nome);
  return {
    assunto: `Boas-vindas à Todos os Jeitos, ${nome}!`,
    ...montar({
      site,
      saudacao: `Olá, ${n}!`,
      paragrafos: [
        "Que bom ter você aqui. A Todos os Jeitos nasceu dentro da sala de aula para apoiar quem ensina alunos neurodivergentes, olhando para quem cada criança é, não só para o diagnóstico.",
      ],
      tituloLista: "Seus primeiros passos:",
      listaNumerada: true,
      lista: [
        "Cadastre seu primeiro aluno e preencha o <strong>perfil vivo</strong>: interesses, pontos fortes, o que funciona e o que trava.",
        "Registre observações rápidas no dia a dia. Elas alimentam o perfil.",
        "Envie uma atividade (texto ou PDF) e receba uma versão adaptada, como rascunho, para revisar.",
        "Quando quiser, convide a família para acompanhar em casa.",
      ],
      destaque: "A IA sugere, você decide: nada chega ao aluno ou à família sem a sua revisão.",
      botao: { texto: "Começar agora", href: `${site}/professor/alunos` },
    }),
  };
}

export function boasVindasEscola({ nome, escola, site }: { nome: string; escola: string; site: string }): Email {
  return {
    // O nome da escola fica so no assunto: no texto, "a escola X" erraria o
    // artigo para nomes masculinos (ex.: "a Colegio Santa Maria")
    assunto: `Boas-vindas, ${escola}!`,
    ...montar({
      site,
      saudacao: `Olá, ${seguro(nome)}!`,
      paragrafos: [
        "A partir de agora, sua escola tem uma visão organizada da inclusão, acompanhando de perto o trabalho dos professores.",
      ],
      tituloLista: "Primeiros passos:",
      listaNumerada: true,
      lista: [
        "Convide seus professores por e-mail.",
        "Acompanhe no painel os alunos, as adaptações e os relatórios revisados.",
        "Professores e escola podem convidar as famílias para acompanhar em casa.",
      ],
      destaque:
        "Por cuidado com os dados das crianças, a escola tem acesso só de leitura. As informações de saúde e as anotações do dia a dia ficam com o professor.",
      botao: { texto: "Abrir o painel", href: `${site}/escola` },
    }),
  };
}

export function boasVindasFamilia({
  nome,
  aluno,
  alunoId,
  site,
}: {
  nome: string;
  aluno: string;
  alunoId: string;
  site: string;
}): Email {
  const a = seguro(aluno);
  return {
    assunto: `Que bom ter você com a gente, ${nome}`,
    ...montar({
      site,
      saudacao: `Olá, ${seguro(nome)}!`,
      paragrafos: [`Agora você acompanha ${a} junto com a escola.`],
      tituloLista: "Na plataforma você encontra:",
      lista: [
        "O que a escola compartilhou com você: observações, atividades e relatórios escritos para a família.",
        "Um espaço para contar como foi em casa. Isso ajuda o professor a ajustar as atividades.",
        "Apoio para o reforço e a lição de casa: a IA orienta você, adulto, a conduzir, sem entregar a resposta pronta. A ideia é apoiar, sem fazer pela criança.",
      ],
      destaque: `Os dados de ${a} são protegidos conforme a LGPD. Se tiver qualquer dúvida, fale com a gente.`,
      botao: { texto: `Acompanhar ${a}`, href: `${site}/familia/filhos/${alunoId}` },
    }),
  };
}
