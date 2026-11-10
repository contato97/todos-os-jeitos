import { redirect } from "next/navigation";

// Os planos agora ficam na pagina inicial (secao #planos), no mesmo padrao
// das outras secoes. Este endereco continua funcionando e leva ate la.
export default function PaginaPlanos() {
  redirect("/#planos");
}
