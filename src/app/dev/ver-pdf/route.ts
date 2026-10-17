// So em desenvolvimento: desenha o PDF de exemplo na tela (pdf.js) para conferir o visual
export async function GET() {
  if (process.env.NODE_ENV !== "development") return new Response("Não encontrado", { status: 404 });
  const html = `<!doctype html><html><body style="margin:0;background:#888">
<div id="paginas" style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px"></div>
<script type="module">
import * as pdfjs from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
const pdf = await pdfjs.getDocument("/dev/exportar?formato=pdf").promise;
for (let n = 1; n <= pdf.numPages; n++) {
  const pagina = await pdf.getPage(n);
  const vp = pagina.getViewport({ scale: 1.2 });
  const c = document.createElement("canvas");
  c.width = vp.width; c.height = vp.height;
  document.getElementById("paginas").append(c);
  await pagina.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
}
const pagina1 = await pdf.getPage(1);
const conteudo = await pagina1.getTextContent();
window.textoPdf = conteudo.items.map((i) => i.str).join(" | ");
document.title = "pronto:" + pdf.numPages;
</script></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
