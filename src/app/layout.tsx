import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todos os Jeitos",
  description:
    "A plataforma pedagógica que acompanha cada aluno neurodivergente, do jeito dele.",
};

// Roda antes de a pagina aparecer: aplica o tema escolhido (claro/escuro),
// para nao "piscar" no tema errado. A mesma chave do botao de tema.
const SCRIPT_TEMA = `try{var t=localStorage.getItem("tdj-tema");if(t==="claro"||t==="escuro")document.documentElement.setAttribute("data-tema",t)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o script acima pode mudar o atributo data-tema antes do React
    <html lang="pt-BR" className={`${lexend.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col font-sans text-lg leading-relaxed">
        {children}
      </body>
    </html>
  );
}
