// Cartao provisorio para as telas que ainda serao construidas
export function EmBreve({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-dashed border-marca/20 p-6">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export function Carregando() {
  return <p className="py-6">Carregando...</p>;
}
