import Image from "next/image";

// Foto de perfil redonda. Sem foto, mostra as iniciais do nome.
export function Avatar({ url, nome, tamanho = 40 }: { url: string | null; nome: string; tamanho?: number }) {
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  if (url) {
    return (
      // unoptimized: o link e temporario (assinado), entao nao vale guardar em cache
      <Image
        src={url}
        alt=""
        width={tamanho}
        height={tamanho}
        unoptimized
        className="shrink-0 rounded-full object-cover ring-2 ring-white"
        style={{ width: tamanho, height: tamanho }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-lavanda/30 font-semibold"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.38 }}
    >
      {iniciais || "?"}
    </span>
  );
}
