import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    serverActions: {
      // PDFs de atividade e fotos de licao chegam a 10 MB (+ folga do envio)
      bodySizeLimit: "11mb",
    },
  },
  partialPrefetching: true,
  turbopack: {
    // Fixa a raiz no projeto: existe um package-lock.json solto na pasta do usuario
    // que confundia o Next.js sobre onde o projeto comeca.
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
