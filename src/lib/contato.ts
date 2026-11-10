// WhatsApp de suporte da Todos os Jeitos (wa.me e o formato oficial do WhatsApp)
const WHATSAPP = "5511971261699";

export function linkWhatsapp(mensagem: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}
