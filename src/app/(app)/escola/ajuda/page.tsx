import { PaginaAjuda } from "@/components/area/como-usar";
import { AJUDA_ESCOLA } from "@/lib/ajuda";

export default function AjudaEscola() {
  return <PaginaAjuda secoes={Object.values(AJUDA_ESCOLA)} />;
}
