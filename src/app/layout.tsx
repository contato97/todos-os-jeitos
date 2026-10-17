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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${lexend.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-lg leading-relaxed">
        {children}
      </body>
    </html>
  );
}
