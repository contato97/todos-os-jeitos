import { PaginaAjuda } from "@/components/area/como-usar";
import { AJUDA_FAMILIA } from "@/lib/ajuda";

export default function AjudaFamilia() {
  return <PaginaAjuda secoes={Object.values(AJUDA_FAMILIA)} />;
}
