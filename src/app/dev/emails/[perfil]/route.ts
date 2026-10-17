import { type NextRequest } from "next/server";
import { boasVindasEscola, boasVindasFamilia, boasVindasProfessor } from "@/lib/email/modelos";

// Pre-visualizacao dos e-mails, so em desenvolvimento:
// /dev/emails/professor, /dev/emails/escola, /dev/emails/familia
export async function GET(request: NextRequest, { params }: RouteContext<"/dev/emails/[perfil]">) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Não encontrado", { status: 404 });
  }

  const { perfil } = await params;
  const site = request.nextUrl.origin;
  const exemplos = {
    professor: () => boasVindasProfessor({ nome: "Ana", site }),
    escola: () => boasVindasEscola({ nome: "Carla", escola: "Escola Raio de Sol", site }),
    familia: () => boasVindasFamilia({ nome: "Marina", aluno: "Lia", alunoId: "exemplo", site }),
  };
  const gerar = exemplos[perfil as keyof typeof exemplos];
  if (!gerar) return new Response("Use professor, escola ou familia", { status: 404 });

  const email = gerar();
  // Mostra o assunto acima do e-mail, como apareceria na caixa de entrada
  const html = email.html.replace(
    "<body",
    `<body><p style="font-family:Arial;padding:8px 16px;margin:0;background:#fff;border-bottom:1px solid #ddd"><strong>Assunto:</strong> ${email.assunto}</p><div`,
  );
  return new Response(html.replace("</body>", "</div></body>"), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
