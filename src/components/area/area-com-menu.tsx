import { MenuLateral, type ItemMenu } from "./menu-lateral";

// Moldura das areas logadas: menu lateral a esquerda (no celular, faixa no topo)
// e o conteudo ao lado. Igual para professor, escola e familia.
export function AreaComMenu({
  rotulo,
  grupos,
  children,
}: {
  rotulo: string;
  grupos: ItemMenu[][];
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
      <aside className="min-w-0 lg:border-r lg:border-marca/10 lg:pr-6">
        <MenuLateral rotulo={rotulo} grupos={grupos} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
