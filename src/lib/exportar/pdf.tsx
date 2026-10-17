import "server-only";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { paraBlocos, type Trecho } from "./blocos";

// PDF com a mesma identidade do site: fonte Lexend (embutida no arquivo),
// letra grande, espacamento amplo e cores da marca.

const COR = { marca: "#0E4357", petroleo: "#12708A", linha: "#d9d2c3" };

const estilos = StyleSheet.create({
  pagina: { fontFamily: "Lexend", fontSize: 13, lineHeight: 1.6, color: COR.marca, paddingTop: 48, paddingBottom: 64, paddingHorizontal: 56 },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COR.linha },
  subtitulo: { fontSize: 11 },
  logo: { width: 110, height: 39 },
  h1: { fontSize: 20, fontWeight: 600, marginBottom: 10 },
  h2: { fontSize: 16, fontWeight: 600, marginTop: 14, marginBottom: 6 },
  h3: { fontSize: 14, fontWeight: 600, marginTop: 10, marginBottom: 4, color: COR.petroleo },
  paragrafo: { marginBottom: 8 },
  item: { flexDirection: "row", marginBottom: 6 },
  marcador: { width: 22 },
  itemTexto: { flex: 1 },
  separador: { borderBottomWidth: 1, borderBottomColor: COR.linha, marginVertical: 10 },
  rodape: { position: "absolute", bottom: 28, left: 56, right: 56, fontSize: 9, textAlign: "center", color: COR.petroleo },
});

function Trechos({ trechos }: { trechos: Trecho[] }) {
  return (
    <>
      {trechos.map((t, i) => (
        <Text key={i} style={{ fontWeight: t.negrito ? 600 : 400, ...(t.italico ? { fontStyle: "italic" as const } : {}) }}>
          {t.texto}
        </Text>
      ))}
    </>
  );
}

export async function gerarPdf({
  titulo,
  subtitulo,
  texto,
  site,
}: {
  titulo: string;
  subtitulo?: string;
  texto: string;
  site: string;
}) {
  // A fonte e a logo sao lidas do proprio site (pasta public)
  Font.register({
    family: "Lexend",
    fonts: [
      { src: `${site}/fonts/lexend-400.woff`, fontWeight: 400 },
      { src: `${site}/fonts/lexend-600.woff`, fontWeight: 600 },
      // Lexend nao tem italico: usamos a regular inclinada pelo proprio leitor
      { src: `${site}/fonts/lexend-400.woff`, fontWeight: 400, fontStyle: "italic" },
      { src: `${site}/fonts/lexend-600.woff`, fontWeight: 600, fontStyle: "italic" },
    ],
  });
  // Nao quebrar palavras com hifen no meio
  Font.registerHyphenationCallback((palavra) => [palavra]);
  // A Lexend nao tem emojis: eles entram como imagens (Twemoji, licenca aberta)
  Font.registerEmojiSource({ format: "png", url: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/" });

  const blocos = paraBlocos(texto);
  const comecaComTitulo = blocos[0]?.tipo === "titulo";

  const documento = (
    <Document title={titulo} author="Todos os Jeitos" language="pt-BR">
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.topo} fixed>
          <Text style={estilos.subtitulo}>{subtitulo ?? ""}</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image do react-pdf nao tem alt */}
          <Image src={`${site}/logo.png`} style={estilos.logo} />
        </View>

        {!comecaComTitulo && <Text style={estilos.h1}>{titulo}</Text>}

        {blocos.map((b, i) => {
          if (b.tipo === "titulo") {
            const estilo = b.nivel <= 1 ? estilos.h1 : b.nivel === 2 ? estilos.h2 : estilos.h3;
            return (
              <Text key={i} style={estilo} minPresenceAhead={40}>
                <Trechos trechos={b.trechos} />
              </Text>
            );
          }
          if (b.tipo === "paragrafo") {
            return (
              <Text key={i} style={estilos.paragrafo}>
                <Trechos trechos={b.trechos} />
              </Text>
            );
          }
          if (b.tipo === "lista") {
            return (
              <View key={i} style={{ marginBottom: 8 }}>
                {b.itens.map((item, j) => (
                  <View key={j} style={estilos.item} wrap={false}>
                    <Text style={estilos.marcador}>{b.ordenada ? `${b.inicio + j}.` : "•"}</Text>
                    <Text style={estilos.itemTexto}>
                      <Trechos trechos={item} />
                    </Text>
                  </View>
                ))}
              </View>
            );
          }
          return <View key={i} style={estilos.separador} />;
        })}

        <Text
          style={estilos.rodape}
          fixed
          render={({ pageNumber, totalPages }) => `Todos os Jeitos · página ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  );

  return renderToBuffer(documento);
}
