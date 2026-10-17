import "server-only";
import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import { paraBlocos, type Trecho } from "./blocos";

// Word acessivel: Verdana (instalada em todo computador com Word e boa para
// leitura), letra 14, espacamento 1,5 e margens confortaveis.
const FONTE = "Verdana";

function corridas(trechos: Trecho[]) {
  return trechos.flatMap((t) =>
    t.texto.split("\n").map(
      (parte, i) => new TextRun({ text: parte, bold: t.negrito, italics: t.italico, break: i > 0 ? 1 : undefined }),
    ),
  );
}

export async function gerarWord({
  titulo,
  subtitulo,
  texto,
  logo,
}: {
  titulo: string;
  subtitulo?: string;
  texto: string;
  logo?: ArrayBuffer | null;
}) {
  const filhos: Paragraph[] = [];
  let listaNumerada = 0;

  if (logo) {
    filhos.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new ImageRun({ type: "png", data: logo, transformation: { width: 150, height: 53 } })],
      }),
    );
  }
  if (subtitulo) filhos.push(new Paragraph({ children: [new TextRun({ text: subtitulo, size: 22 })], spacing: { after: 200 } }));

  const blocos = paraBlocos(texto);
  // Se o texto nao comecar com um titulo, usamos o titulo da atividade
  if (blocos[0]?.tipo !== "titulo") {
    filhos.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(titulo)] }));
  }

  for (const b of blocos) {
    if (b.tipo === "titulo") {
      const nivel = [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2][Math.min(b.nivel, 3) - 1];
      filhos.push(new Paragraph({ heading: nivel, children: corridas(b.trechos) }));
    } else if (b.tipo === "paragrafo") {
      filhos.push(new Paragraph({ children: corridas(b.trechos) }));
    } else if (b.tipo === "lista") {
      listaNumerada += 1;
      for (const item of b.itens) {
        filhos.push(
          new Paragraph({
            children: corridas(item),
            ...(b.ordenada
              ? { numbering: { reference: "numeros", level: 0, instance: listaNumerada } }
              : { bullet: { level: 0 } }),
          }),
        );
      }
    } else {
      filhos.push(new Paragraph({ border: { bottom: { style: "single", size: 6, color: "0E4357", space: 1 } } }));
    }
  }

  const doc = new Document({
    creator: "Todos os Jeitos",
    title: titulo,
    styles: {
      default: {
        document: { run: { font: FONTE, size: 28, color: "0E4357" }, paragraph: { spacing: { line: 360, after: 160 } } },
        title: { run: { font: FONTE, size: 40, bold: true, color: "0E4357" }, paragraph: { spacing: { after: 240 } } },
        heading1: { run: { font: FONTE, size: 34, bold: true, color: "0E4357" }, paragraph: { spacing: { before: 280, after: 160 } } },
        heading2: { run: { font: FONTE, size: 30, bold: true, color: "12708A" }, paragraph: { spacing: { before: 240, after: 120 } } },
      },
    },
    numbering: {
      config: [
        {
          reference: "numeros",
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }],
        },
      ],
    },
    sections: [
      {
        properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Todos os Jeitos · página ", size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: filhos,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
