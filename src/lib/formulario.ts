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
