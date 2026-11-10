import { formatarData } from "@/components/ui";
import { rotuloCargo } from "@/lib/opcoes-cadastro";

export type Assinatura = {
  id: string;
  nome_assinante: string;
  papel: string;
  cargo?: string | null;
  conteudo_sha256: string;
  assinado_em: string;
};

// Codigo curto para conferir a assinatura: os 12 primeiros caracteres da
// "impressao digital" (sha256) do texto assinado
export function codigoVerificacao(sha256: string) {
  return sha256.slice(0, 12).toUpperCase().replace(/(.{4})(?!$)/g, "$1-");
}

// Lista de quem assinou um encaminhamento ou relatorio (familia e/ou escola)
export function AssinaturasEncaminhamento({ assinaturas }: { assinaturas: Assinatura[] }) {
  if (!assinaturas.length) return null;
  return (
    <ul className="mt-4 space-y-2">
      {assinaturas.map((a) => (
        <li key={a.id} className="rounded-xl bg-salvia/15 p-3 text-base">
          <p className="font-semibold">✓ {a.nome_assinante}</p>
          <p>
            {rotuloPapel(a.papel, a.cargo)} · {formatarData(a.assinado_em, true)}
          </p>
          <p>Código de verificação: {codigoVerificacao(a.conteudo_sha256)}</p>
        </li>
      ))}
    </ul>
  );
}

export function rotuloPapel(papel: string, cargo?: string | null) {
  if (papel === "familia") return "Família";
  const c = rotuloCargo(cargo);
  return c ? `Escola · ${c}` : "Escola";
}
