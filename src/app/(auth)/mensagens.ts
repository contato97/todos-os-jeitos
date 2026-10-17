// Traduz os erros do Supabase Auth para mensagens claras em portugues.
// Os codigos estao em https://supabase.com/docs/guides/auth/debugging/error-codes
const MENSAGENS: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar. Procure o link que enviamos.",
  user_already_exists: "Já existe uma conta com este e-mail.",
  weak_password: "Escolha uma senha mais forte, com pelo menos 8 caracteres.",
  over_email_send_rate_limit: "Muitos e-mails enviados. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  same_password: "A nova senha precisa ser diferente da anterior.",
};

export function mensagemDeErro(codigo?: string) {
  return (codigo && MENSAGENS[codigo]) || "Algo deu errado. Tente novamente em instantes.";
}

// Estado que as Server Actions devolvem para o formulario mostrar
export type EstadoFormulario = {
  erro?: string;
  sucesso?: string;
  // Valores digitados, para o formulario nao "apagar" tudo quando ha erro
  valores?: Record<string, string>;
};

export function lerCampo(formData: FormData, nome: string) {
  const valor = formData.get(nome);
  return typeof valor === "string" ? valor.trim() : "";
}

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SENHA_MINIMA = 8;
