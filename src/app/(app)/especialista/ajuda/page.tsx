import { PaginaAjuda } from "@/components/area/como-usar";
import { AJUDA_ESPECIALISTA } from "@/lib/ajuda";

export default function AjudaEspecialista() {
  return <PaginaAjuda secoes={Object.values(AJUDA_ESPECIALISTA)} />;
}
