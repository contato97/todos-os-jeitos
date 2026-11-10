import { formatarData } from "@/components/ui";

export type Assinatura = {
  id: string;
  nome_assinante: string;
  papel: string;
  conteudo_sha256: string;
  assinado_em: string;
};

// Codigo curto para conferir a assinatura: os 12 primeiros caracteres da
// "impressao digital" (sha256) do texto assinado
export function codigoVerificacao(sha256: string) {
  return sha256.slice(0, 12).toUpperCase().replace(/(.{4})(?!$)/g, "$1-");
}

// Lista de quem assinou (aparece para professor, escola, especialista e familia)
export function AssinaturasEncaminhamento({ assinaturas }: { assinaturas: Assinatura[] }) {
  if (!assinaturas.length) return null;
  return (
    <ul className="mt-4 space-y-2">
      {assinaturas.map((a) => (
        <li key={a.id} className="rounded-xl bg-salvia/15 p-3 text-base">
          <p className="font-semibold">✓ {a.nome_assinante}</p>
          <p>
            {a.papel === "familia" ? "Família" : a.papel} · {formatarData(a.assinado_em, true)}
          </p>
          <p>Código de verificação: {codigoVerificacao(a.conteudo_sha256)}</p>
        </li>
      ))}
    </ul>
  );
}
