import { FaWhatsapp } from "react-icons/fa6";
import { linkWhatsapp } from "@/lib/contato";

// Botao fixo no canto da tela, em todas as areas logadas: fala com o suporte pelo WhatsApp
export function BotaoSuporte() {
  return (
    <a
      href={linkWhatsapp("Olá! Preciso de ajuda com a plataforma Todos os Jeitos.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o suporte pelo WhatsApp"
      title="Falar com o suporte"
      className="fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full bg-marca px-4 py-3 font-medium text-creme shadow-lg hover:bg-petroleo sm:right-6 sm:bottom-6"
    >
      <FaWhatsapp aria-hidden="true" className="size-6" />
      <span className="hidden sm:inline">Suporte</span>
    </a>
  );
}
