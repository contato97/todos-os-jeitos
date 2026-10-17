import Image from "next/image";

// Logo nas duas versoes: o CSS mostra a certa para o tema (claro ou escuro)
export function Logo({ className = "h-12 w-auto", prioridade = false }: { className?: string; prioridade?: boolean }) {
  return (
    <>
      <Image src="/logo.png" alt="" width={1082} height={380} priority={prioridade} className={`logo-clara ${className}`} />
      <Image src="/logo-escuro.png" alt="" width={1082} height={380} priority={prioridade} className={`logo-escura ${className}`} />
    </>
  );
}
