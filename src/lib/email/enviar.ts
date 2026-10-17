import "server-only";
import type { Email } from "./modelos";

// Envia um e-mail pelo Resend (https://resend.com), usando a API direto com fetch.
// Se a chave nao estiver configurada, so registra no terminal e segue:
// um e-mail que falhou nunca deve impedir a pessoa de usar a plataforma.
export async function enviarEmail(para: string, email: Email) {
  const chave = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE;
  if (!chave || !remetente) {
    console.warn(`[email] RESEND_API_KEY/EMAIL_REMETENTE ausentes: "${email.assunto}" não foi enviado.`);
    return false;
  }

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: remetente, to: para, subject: email.assunto, html: email.html, text: email.texto }),
  });

  if (!resposta.ok) {
    console.error(`[email] falha ao enviar "${email.assunto}":`, resposta.status, await resposta.text());
    return false;
  }
  return true;
}
