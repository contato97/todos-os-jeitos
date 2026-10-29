// Pecas comuns das Server Actions de formulario

// Estado que as Server Actions devolvem para o formulario mostrar
export type EstadoFormulario = {
  erro?: string;
  sucesso?: string;
  aviso?: string;
  // Valores digitados, para o formulario nao "apagar" tudo quando ha erro
  valores?: Record<string, string>;
  // Informacao extra para a tela (ex.: link de convite gerado)
  dado?: string;
};

export function lerCampo(formData: FormData, nome: string) {
  const valor = formData.get(nome);
  return typeof valor === "string" ? valor.trim() : "";
}

// So aceita destinos internos ("/algo"), para um link nao mandar a pessoa a um site falso
export function destinoSeguro(destino: string | null | undefined) {
  return destino && destino.startsWith("/") && !destino.startsWith("//") ? destino : null;
}

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// WhatsApp: guardamos so os digitos, com DDD (10 ou 11) e, se vier, o 55 do Brasil.
// Devolve null quando o numero nao parece valido.
export function lerWhatsapp(formData: FormData, nome = "whatsapp") {
  const digitos = lerCampo(formData, nome).replace(/\D/g, "");
  return /^(55)?[0-9]{10,11}$/.test(digitos) ? digitos : null;
}

// Mostra o numero do jeito que a gente le: (11) 97126-1699
export function formatarWhatsapp(digitos: string | null | undefined) {
  if (!digitos) return "";
  const local = digitos.length > 11 ? digitos.slice(2) : digitos;
  const ddd = local.slice(0, 2);
  const resto = local.slice(2);
  return `(${ddd}) ${resto.slice(0, resto.length - 4)}-${resto.slice(-4)}`;
}

