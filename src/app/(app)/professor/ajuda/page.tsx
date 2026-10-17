import { PaginaAjuda } from "@/components/area/como-usar";
import { AJUDA_PROFESSOR } from "@/lib/ajuda";

export default function AjudaProfessor() {
  return <PaginaAjuda secoes={Object.values(AJUDA_PROFESSOR)} />;
}
