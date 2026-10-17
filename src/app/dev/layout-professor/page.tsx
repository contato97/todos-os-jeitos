import { notFound } from "next/navigation";
import { FormularioDados, FormularioEmail, FormularioFoto, FormularioSenha } from "@/components/area/conta-formularios";
import { MenuLateral } from "@/components/area/menu-lateral";
import { Cartao } from "@/components/ui";

// So em desenvolvimento: confere o menu lateral e a "Minha conta" sem precisar de login
export default function LayoutTeste() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        <aside className="min-w-0 lg:border-r lg:border-marca/10 lg:pr-6">
          <MenuLateral
            rotulo="Área do professor"
            grupos={[
              [
                { href: "/professor", rotulo: "Painel", icone: "painel", exato: true },
                { href: "/professor/alunos", rotulo: "Meus alunos", icone: "alunos" },
                { href: "/professor/adaptar", rotulo: "Adaptar atividade", icone: "adaptar", destaque: true },
                { href: "/professor/familias", rotulo: "Comunicação com a família", icone: "familias" },
                { href: "/professor/convidar", rotulo: "Convidar família", icone: "convidar" },
              ],
              [
                { href: "/professor/ajuda", rotulo: "Central de ajuda", icone: "ajuda" },
                { href: "/dev/layout-professor", rotulo: "Minha conta", icone: "conta" },
              ],
            ]}
          />
        </aside>
        <div className="min-w-0">
          <div className="mx-auto w-full max-w-3xl">
            <h1 className="text-3xl font-semibold">Minha conta</h1>
            <div className="mt-6 flex flex-col gap-6">
              <Cartao>
                <h2 className="mb-4 text-xl font-semibold">Foto de perfil</h2>
                <FormularioFoto urlAtual={null} nome="Bianca Casagrande" />
              </Cartao>
              <Cartao>
                <h2 className="mb-4 text-xl font-semibold">Meus dados</h2>
                <FormularioDados
                  dados={{ tipo: "professor", nome: "Bianca", escola: "Escola Exemplo", rede: "publica", etapas: ["fundamental_1"], atuacao: "polivalente" }}
                />
              </Cartao>
              <Cartao>
                <h2 className="mb-4 text-xl font-semibold">E-mail de acesso</h2>
                <FormularioEmail emailAtual="exemplo@teste.com" />
              </Cartao>
              <Cartao>
                <h2 className="mb-4 text-xl font-semibold">Senha</h2>
                <FormularioSenha />
              </Cartao>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
