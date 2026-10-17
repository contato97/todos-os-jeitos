import { FaEnvelope, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa6";
import { SiteHeader } from "@/components/site-header";

// As cores de destaque (mostarda, coral, lavanda, salvia) aparecem so como faixas
// decorativas: elas nao tem contraste suficiente para texto sobre o creme.

const desafios = [
  {
    titulo: "Adaptar toma tempo",
    texto:
      "O professor adapta provas e atividades sozinho, muitas vezes fora do horário e sem apoio especializado.",
  },
  {
    titulo: "Rótulo não é aluno",
    texto:
      "As ferramentas adaptam pelo diagnóstico, mas dois alunos com o mesmo laudo podem precisar de coisas opostas.",
  },
  {
    titulo: "Cada um fala uma língua",
    texto:
      "Escola, família e terapeutas raramente compartilham o que funciona para a criança.",
  },
];

const recursos = [
  {
    titulo: "Adaptação",
    texto: "Provas e atividades adaptadas pelo perfil de cada aluno.",
    faixa: "bg-petroleo",
  },
  {
    titulo: "Observação",
    texto: "Registros rápidos pelo celular, que formam um histórico ao longo das semanas.",
    faixa: "bg-mostarda",
  },
  {
    titulo: "Relatórios",
    texto: "Uma versão acolhedora para a família e uma versão técnica para especialistas.",
    faixa: "bg-coral",
  },
  {
    titulo: "Reforço mediado",
    texto: "Atividades personalizadas para casa, sempre aplicadas por um adulto.",
    faixa: "bg-lavanda",
  },
  {
    titulo: "Espaço da família",
    texto: "Orientação para apoiar a lição de casa e a rotina, sem fazer pela criança.",
    faixa: "bg-salvia",
  },
];

const publicos = [
  {
    titulo: "Professores",
    texto:
      "Adaptam, observam e geram relatórios em minutos, com o histórico de cada aluno à mão.",
    faixa: "bg-petroleo",
  },
  {
    titulo: "Escolas e redes",
    texto:
      "Têm uma visão organizada da inclusão, com adaptações acompanhadas pela coordenação.",
    faixa: "bg-mostarda",
  },
  {
    titulo: "Famílias",
    texto:
      "Recebem reforço personalizado e aprendem a apoiar o filho em casa, sem fazer por ele.",
    faixa: "bg-coral",
  },
  {
    titulo: "Especialistas",
    texto:
      "Com autorização da família, recebem relatórios técnicos e devolvem orientações à escola.",
    faixa: "bg-lavanda",
  },
];

const compromissos = [
  {
    titulo: "Baseado em evidência",
    texto: "Orientações fundamentadas na pesquisa, sem promessas exageradas.",
  },
  {
    titulo: "IA com supervisão humana",
    texto:
      "Toda adaptação, relatório ou reforço passa por um adulto antes de chegar à criança.",
  },
  {
    titulo: "Ética profissional",
    texto: "O professor observa e relata; diagnóstico é papel dos profissionais de saúde.",
  },
  {
    titulo: "Proteção de dados",
    texto: "Consentimento dos pais e cuidado com os dados das crianças, conforme a LGPD.",
  },
];

const pilares = [
  {
    titulo: "Pelo perfil, não pelo rótulo",
    texto: "Cada adaptação parte do que funciona, do que trava e do que encanta aquele aluno.",
    faixa: "border-petroleo",
  },
  {
    titulo: "A IA apoia, o adulto decide",
    texto: "Nada chega à criança sem passar antes pelas mãos de um professor ou responsável.",
    faixa: "border-mostarda",
  },
  {
    titulo: "Escola e família do mesmo lado",
    texto: "O que acontece na sala e em casa vira um histórico só, compartilhado com cuidado.",
    faixa: "border-coral",
  },
];

// Link do WhatsApp com mensagem ja preenchida (wa.me e o formato oficial do WhatsApp)
const whatsapp =
  "https://wa.me/5511971261699?text=" +
  encodeURIComponent("Olá! Quero conhecer a Todos os Jeitos.");

const redes = [
  { rotulo: "Instagram", href: "https://www.instagram.com/todososjeitos", Icone: FaInstagram },
  { rotulo: "YouTube", href: "https://www.youtube.com/@TodososJeitos", Icone: FaYoutube },
  { rotulo: "E-mail", href: "mailto:contato@todososjeitos.com", Icone: FaEnvelope },
];

function Cartao({ titulo, texto, faixa }: { titulo: string; texto: string; faixa?: string }) {
  return (
    <li className="overflow-hidden rounded-2xl bg-white/70 shadow-sm ring-1 ring-marca/10">
      {faixa && <div className={`h-1.5 ${faixa}`} aria-hidden="true" />}
      <div className="p-6">
        <h3 className="text-xl font-semibold">{titulo}</h3>
        <p className="mt-2">{texto}</p>
      </div>
    </li>
  );
}

function Secao({
  id,
  rotulo,
  titulo,
  children,
  className = "",
}: {
  id: string;
  rotulo?: string;
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // scroll-mt-24: ao clicar no menu, a secao para abaixo do cabecalho fixo, sem ficar escondida
    <section aria-labelledby={`${id}-titulo`} id={id} className={`scroll-mt-24 px-4 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {rotulo && (
          <p className="text-sm font-semibold uppercase tracking-wider text-petroleo">{rotulo}</p>
        )}
        <h2 id={`${id}-titulo`} className="mt-2 text-3xl font-semibold sm:text-4xl">
          {titulo}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />

      <main id="conteudo">
        {/* Topo */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Cada aluno aprende do seu jeito.
            </h1>
            <p className="mt-6 text-xl">
              A Todos os Jeitos é uma plataforma pedagógica criada dentro da sala de aula para
              apoiar professores de alunos neurodivergentes. Em vez de adaptar só pelo
              diagnóstico, olhamos para quem cada criança é: o que a ajuda, o que a trava e o que
              desperta o seu interesse.
            </p>
          </div>
          <ul className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3">
            {pilares.map((p) => (
              <li key={p.titulo} className={`rounded-2xl border-t-4 bg-white/70 p-6 ring-1 ring-marca/10 ${p.faixa}`}>
                <h2 className="text-xl font-semibold">{p.titulo}</h2>
                <p className="mt-2">{p.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Quem somos */}
        <Secao id="quem-somos" rotulo="Quem somos" titulo="Nascemos dentro da sala de aula." className="bg-white/50">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <p>
                Vivemos de perto o esforço de adaptar atividades, acompanhar cada aluno e
                conversar com as famílias, e decidimos construir a ferramenta que gostaríamos de
                ter.
              </p>
              <p className="rounded-2xl border-l-4 border-mostarda bg-creme p-5 font-medium">
                Nossa missão: fazer cada aluno neurodivergente aprender do seu jeito, com escola e
                família do mesmo lado.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              <li className="rounded-2xl bg-creme p-6 ring-1 ring-marca/10">
                <p className="text-sm font-semibold uppercase tracking-wider text-petroleo">Fundadora</p>
                <p className="mt-1 text-xl font-semibold">Juliana Delfino</p>
                <p className="mt-2">Pedagoga, psicopedagoga e neuropsicopedagoga.</p>
              </li>
              <li className="rounded-2xl bg-creme p-6 ring-1 ring-marca/10">
                <p className="text-sm font-semibold uppercase tracking-wider text-petroleo">Cofundadora</p>
                <p className="mt-1 text-xl font-semibold">Bianca Casagrande</p>
                <p className="mt-2">
                  Publicitária, com MBA em Customer Experience e estudante de tecnologia.
                </p>
              </li>
            </ul>
          </div>
        </Secao>

        {/* Desafio */}
        <Secao id="desafio" rotulo="O desafio" titulo="O desafio de quem ensina">
          <ol className="grid gap-6 md:grid-cols-3">
            {desafios.map((d, i) => (
              <li key={d.titulo} className="rounded-2xl bg-white/70 p-6 ring-1 ring-marca/10">
                <p className="text-sm font-semibold text-petroleo">0{i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{d.titulo}</h3>
                <p className="mt-2">{d.texto}</p>
              </li>
            ))}
          </ol>
        </Secao>

        {/* Como funciona */}
        <Secao
          id="como-funciona"
          rotulo="Nossa proposta"
          titulo="Não adaptamos só a prova. Acompanhamos o aluno."
          className="bg-white/50"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-marca p-8 text-creme lg:row-span-2">
              <p className="text-sm font-semibold uppercase tracking-wider">No centro</p>
              <h3 className="mt-2 text-2xl font-semibold">Perfil vivo do aluno</h3>
              <p className="mt-4">
                O que funciona, o que trava, interesses e pontos fortes. Tudo o que acontece na
                plataforma alimenta o perfil, e o perfil melhora tudo.
              </p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
              {recursos.map((r) => (
                <Cartao key={r.titulo} {...r} />
              ))}
            </ul>
          </div>
        </Secao>

        {/* Para quem e */}
        <Secao id="para-quem" rotulo="Para quem é" titulo="Professor, família e especialistas conectados">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {publicos.map((p) => (
              <Cartao key={p.titulo} {...p} />
            ))}
          </ul>
        </Secao>

        {/* Compromisso */}
        <Secao id="compromisso" rotulo="Nosso compromisso" titulo="Cuidado em cada detalhe" className="bg-white/50">
          <ul className="grid gap-6 sm:grid-cols-2">
            {compromissos.map((c) => (
              <Cartao key={c.titulo} {...c} />
            ))}
          </ul>
        </Secao>

        {/* Chamada final */}
        <section id="contato" className="scroll-mt-24 px-4 py-20 text-center">
          <h2 className="text-3xl font-semibold">Vamos conversar?</h2>
          <p className="mx-auto mt-4 max-w-xl">
            Tire suas dúvidas ou fale com a gente para levar a plataforma à sua escola.
          </p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-marca px-7 py-3 font-medium text-creme hover:bg-petroleo"
          >
            <FaWhatsapp aria-hidden="true" className="size-6" />
            Falar no WhatsApp
          </a>
        </section>
      </main>

      <footer className="bg-marca px-4 py-12 text-creme">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <p className="font-medium">Acompanhe a gente</p>
          <ul className="flex gap-4">
            {redes.map(({ rotulo, href, Icone }) => (
              <li key={rotulo}>
                {/* So o icone aparece, entao o aria-label diz ao leitor de tela o que e o link.
                    No fundo escuro, o contorno de foco precisa ser claro para aparecer. */}
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={rotulo}
                  title={rotulo}
                  className="flex size-12 items-center justify-center rounded-full bg-creme/10 hover:bg-creme/20 focus-visible:outline-creme"
                >
                  <Icone aria-hidden="true" className="size-6" />
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm opacity-90">
            © 2026 Todos os Jeitos. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
