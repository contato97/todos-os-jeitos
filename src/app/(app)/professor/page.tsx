import { redirect } from "next/navigation";

// A pagina inicial do professor e a lista de alunos
export default function InicioProfessor() {
  redirect("/professor/alunos");
}
