import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    serverActions: {
      // Ate 4 MB de arquivos por envio (+ folga): o Netlify aceita ~4,5 MB por requisicao
      bodySizeLimit: "5mb",
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
