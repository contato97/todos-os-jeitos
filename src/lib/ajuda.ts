// Textos de ajuda ("Como usar esta tela") de cada area.
// Fica tudo neste arquivo para a equipe revisar e editar os textos num lugar so.

export type Pergunta = { pergunta: string; resposta: string };
export type SecaoAjuda = { titulo: string; perguntas: Pergunta[] };

export const AJUDA_PROFESSOR = {
  painel: {
    titulo: "Painel",
    perguntas: [
      {
        pergunta: "O que o painel mostra?",
        resposta:
          "Um resumo do seu acompanhamento: quantos alunos, observações da semana, atividades adaptadas, rascunhos esperando revisão e mensagens que chegaram das famílias. Clique em um número para ir direto ao assunto.",
      },
      {
        pergunta: "O que significa “Registrar algo” ao lado de um aluno?",
        resposta: "Que faz mais de 14 dias sem observação dele. Um registro rápido ajuda a manter o perfil vivo.",
      },
    ],
  },
  alunos: {
    titulo: "Meus alunos",
    perguntas: [
      {
        pergunta: "Por onde eu começo?",
        resposta:
          "Cadastre um aluno pelo botão “Novo aluno”. O perfil vivo dele é a base de tudo: das adaptações, dos relatórios e do reforço em casa.",
      },
      {
        pergunta: "Quem mais vê os meus alunos?",
        resposta:
          "Só você. A família vê apenas o próprio filho, depois de aceitar o convite e dar o consentimento. Se você estiver vinculado a uma escola, a coordenação vê os alunos, mas só para leitura, e sem informações de saúde.",
      },
    ],
  },
  novoAluno: {
    titulo: "Novo aluno",
    perguntas: [
      {
        pergunta: "Preciso preencher tudo agora?",
        resposta:
          "Não. Comece pelo nome e pelo que você já sabe. O perfil é “vivo”: você completa aos poucos, conforme conhece melhor o aluno.",
      },
      {
        pergunta: "Devo informar o diagnóstico?",
        resposta:
          "Não é obrigatório. A plataforma trabalha pelo perfil, não pelo rótulo. Se a família compartilhou um laudo, você pode registrar no campo opcional de saúde, que só você vê e que nunca é enviado para a IA.",
      },
      {
        pergunta: "Posso anexar laudos e relatórios de profissionais de saúde?",
        resposta:
          "Sim: PDF, foto ou Word, na etapa “Saúde” do cadastro ou depois, no cartão “Saúde” do perfil. São dados sensíveis: só você acessa (nem a escola nem a família veem), eles nunca vão para a IA e, nas fotos, apagamos dados escondidos como a localização.",
      },
    ],
  },
  perfil: {
    titulo: "Perfil vivo",
    perguntas: [
      {
        pergunta: "O que escrever em “o que funciona” e “o que trava”?",
        resposta:
          "Situações concretas da rotina. Por exemplo: “entende melhor com instruções curtas, uma de cada vez” ou “trava quando o texto é longo e sem imagens”.",
      },
      {
        pergunta: "Para que servem os interesses?",
        resposta:
          "A IA usa os interesses para criar exemplos que prendem a atenção. Se o aluno ama dinossauros, um problema de matemática pode falar de dinossauros.",
      },
    ],
  },
  observacoes: {
    titulo: "Observações",
    perguntas: [
      {
        pergunta: "Como registrar uma observação?",
        resposta:
          "Escreva o que aconteceu, do jeito que viu, em poucas linhas. A data entra sozinha, mas você pode mudar. Dá para fazer pelo celular, logo depois da aula.",
      },
      {
        pergunta: "A família vê o que eu escrevo?",
        resposta:
          "Só as observações que você marcar como “compartilhar com a família”. As outras ficam só com você.",
      },
      {
        pergunta: "O que são as observações “de casa”?",
        resposta: "São registros que a família envia sobre como foi a lição, a rotina e o que ajudou em casa.",
      },
    ],
  },
  atividades: {
    titulo: "Atividades adaptadas",
    perguntas: [
      {
        pergunta: "Como adaptar uma atividade?",
        resposta:
          "Cole o texto ou envie o PDF da atividade. A IA cria uma versão adaptada pelo perfil do aluno, que chega como rascunho.",
      },
      {
        pergunta: "Posso mudar o que a IA fez?",
        resposta:
          "Deve! O rascunho é editável. Só depois de você marcar como revisado é que a atividade pode ser exportada em PDF ou compartilhada com a família.",
      },
      {
        pergunta: "O nome do aluno vai para a IA?",
        resposta:
          "Não. A IA recebe só as características do perfil (interesses, o que funciona, o que trava), sem o nome nem as informações de saúde.",
      },
    ],
  },
  relatorios: {
    titulo: "Relatórios",
    perguntas: [
      {
        pergunta: "Como o relatório é feito?",
        resposta:
          "Você escolhe o período e a IA prepara um rascunho a partir das observações e do perfil, em duas versões: uma acolhedora, para a família, e uma técnica, para especialistas.",
      },
      {
        pergunta: "A IA pode sugerir um diagnóstico?",
        resposta:
          "Não. A IA descreve o que foi observado e nunca sugere diagnósticos: isso é papel dos profissionais de saúde.",
      },
    ],
  },
  comunicacao: {
    titulo: "Comunicação com a família",
    perguntas: [
      {
        pergunta: "Como mando um recado para a família?",
        resposta:
          "Em “Comunicação com a família”, escolha o aluno e escreva o recado. Ele vira uma observação compartilhada e aparece no histórico que a família vê.",
      },
      {
        pergunta: "Onde vejo o que a família contou de casa?",
        resposta: "Na mesma tela, em “O que chegou de casa”, e também no perfil de cada aluno, com a etiqueta “De casa”.",
      },
    ],
  },
  familia: {
    titulo: "Convidar família",
    perguntas: [
      {
        pergunta: "Como convido a família?",
        resposta:
          "Informe o e-mail do responsável. Ele recebe um link, cria a conta e, no primeiro acesso, lê e aceita como os dados do filho são usados (LGPD).",
      },
      {
        pergunta: "O que a família consegue fazer?",
        resposta:
          "Ver o que você compartilhou, enviar observações de casa e pedir apoio da IA para o reforço e a lição de casa. Você acompanha esse reforço por aqui.",
      },
    ],
  },
} satisfies Record<string, SecaoAjuda>;

export const AJUDA_ESCOLA = {
  visaoGeral: {
    titulo: "Visão geral",
    perguntas: [
      {
        pergunta: "De onde vêm esses números?",
        resposta:
          "Dos professores vinculados à escola: quantos alunos eles acompanham, quantas observações registraram no mês, quantas atividades e relatórios já foram revisados e quantas famílias estão conectadas.",
      },
      {
        pergunta: "O que é o bloco “Pede atenção”?",
        resposta:
          "Um lembrete do que pode precisar de apoio da coordenação: professores sem adaptações no último mês, alunos sem nenhuma atividade adaptada, alunos sem família conectada e convites ainda sem resposta. Clique em cada item para ver os detalhes.",
      },
      {
        pergunta: "Por que a escola vê números e não as observações?",
        resposta:
          "As observações do dia a dia, os dados de saúde e os contatos das famílias são do professor e da família (LGPD). A escola acompanha o panorama e o que já foi revisado, sem acessar esses conteúdos.",
      },
    ],
  },
  professores: {
    titulo: "Professores",
    perguntas: [
      {
        pergunta: "Como vinculo um professor à escola?",
        resposta:
          "Envie um convite para o e-mail dele. Quando o professor aceita, ele passa a aparecer aqui e os alunos dele entram no painel.",
      },
      {
        pergunta: "Posso editar o trabalho dos professores?",
        resposta: "Não. O acesso da escola é só de leitura: quem cria e edita é sempre o professor.",
      },
    ],
  },
  alunos: {
    titulo: "Alunos",
    perguntas: [
      {
        pergunta: "Por que não vejo as informações de saúde?",
        resposta:
          "Por cuidado com os dados das crianças (LGPD), informações de saúde e anotações do dia a dia da sala ficam só com o professor.",
      },
      {
        pergunta: "A escola pode convidar famílias?",
        resposta: "Sim. Pelo aluno, você envia o convite para o e-mail do responsável.",
      },
    ],
  },
  especialistas: {
    titulo: "Especialistas",
    perguntas: [
      {
        pergunta: "Quem pode entrar como especialista?",
        resposta:
          "Profissionais que acompanham os alunos fora da escola: psicólogos, terapeutas ocupacionais, fonoaudiólogos, neuropediatras, psicopedagogos e outros. Eles só entram pelo convite que a coordenação ou direção envia.",
      },
      {
        pergunta: "O especialista vê todos os alunos?",
        resposta:
          "Não. Ele só vê os alunos que você escolher. Para cada aluno, você decide se ele pode ver os relatórios revisados e se pode registrar orientações. Dá para mudar ou tirar o acesso a qualquer momento.",
      },
      {
        pergunta: "Por que a escola não vê as informações clínicas do especialista?",
        resposta:
          "Medicações, receitas e outras informações de saúde são dados sensíveis (LGPD). Elas ficam só com o professor do aluno e a família. A escola vê as orientações pedagógicas.",
      },
    ],
  },
} satisfies Record<string, SecaoAjuda>;

export const AJUDA_FAMILIA = {
  filhos: {
    titulo: "Meus filhos",
    perguntas: [
      {
        pergunta: "Por que preciso dar consentimento?",
        resposta:
          "A lei (LGPD) protege os dados das crianças. Antes de ver qualquer informação, você lê e aceita como esses dados são usados e protegidos.",
      },
      {
        pergunta: "Tenho mais de um filho na plataforma. E agora?",
        resposta: "Cada convite aceito aparece aqui. Escolha o filho para ver o que é dele.",
      },
    ],
  },
  historico: {
    titulo: "Histórico",
    perguntas: [
      {
        pergunta: "O que aparece aqui?",
        resposta:
          "O que a escola compartilhou com você: observações, atividades adaptadas e relatórios escritos para a família.",
      },
      {
        pergunta: "Por que não vejo tudo o que o professor registra?",
        resposta:
          "O professor escolhe o que compartilhar. Anotações rápidas do dia a dia da sala podem ficar só com ele.",
      },
    ],
  },
  observacoes: {
    titulo: "Observações de casa",
    perguntas: [
      {
        pergunta: "O que vale a pena contar?",
        resposta:
          "Como foi a lição, o que ajudou, o que foi difícil, mudanças na rotina ou no sono. Frases curtas já ajudam muito.",
      },
      {
        pergunta: "Quem lê o que eu escrevo?",
        resposta: "O professor do seu filho, que usa isso para ajustar as atividades.",
      },
    ],
  },
  casa: {
    titulo: "Como é em casa",
    perguntas: [
      {
        pergunta: "Para que serve esta ficha?",
        resposta:
          "Para você contar como seu filho é em casa: o jeito dele, como faz as tarefas, medicações e acompanhamentos. Com isso, o professor conhece a criança por inteiro e o acompanhamento fica mais individualizado.",
      },
      {
        pergunta: "Quem vê o que eu escrevo aqui?",
        resposta:
          "Só você e o professor do seu filho. A escola (coordenação) não vê esta ficha, porque ela pode ter informações de saúde.",
      },
      {
        pergunta: "A inteligência artificial lê as medicações?",
        resposta:
          "Não. Medicações e acompanhamentos nunca vão para a IA. Só o jeito em casa e a rotina de estudo ajudam a IA a sugerir atividades mais parecidas com seu filho, sempre sem o nome dele.",
      },
    ],
  },
  reforco: {
    titulo: "Reforço e lição de casa",
    perguntas: [
      {
        pergunta: "Como funciona a assistente de reforço?",
        resposta:
          "Você escolhe o que precisa (reforço, ajuda com a lição, outras formas de explicar ou material para imprimir), a matéria, o conteúdo e quanto tempo tem. A assistente usa o perfil do seu filho e devolve um passo a passo para você, jeitos diferentes de ensinar e um material pronto para a criança.",
      },
      {
        pergunta: "Como imprimo o material?",
        resposta:
          "Embaixo de cada orientação há “Baixar ou copiar”. Escolha “Material para a criança” para baixar só a folha dela (em PDF, Word ou imagem), sem as orientações para o adulto.",
      },
      {
        pergunta: "A IA faz a lição pelo meu filho?",
        resposta:
          "Não. A IA explica o conteúdo para você e sugere perguntas e passos para guiar a criança, sem dar as respostas. A ideia é apoiar, sem fazer por ele.",
      },
      {
        pergunta: "Meu filho pode usar sozinho?",
        resposta:
          "O reforço é pensado para ser conduzido por um adulto. Esse cuidado faz parte do nosso compromisso de ter sempre uma pessoa por perto.",
      },
    ],
  },
} satisfies Record<string, SecaoAjuda>;

export const AJUDA_ESPECIALISTA = {
  alunos: {
    titulo: "Meus alunos",
    perguntas: [
      {
        pergunta: "Por que vejo só alguns alunos?",
        resposta:
          "A escola escolhe quais alunos você acompanha. Se faltar alguém, fale com a coordenação ou direção que convidou você.",
      },
      {
        pergunta: "O que consigo ver de cada aluno?",
        resposta:
          "O perfil de aprendizagem (o que funciona, o que trava, interesses e pontos fortes) e, se a escola liberar, os relatórios já revisados pelo professor.",
      },
    ],
  },
  registros: {
    titulo: "Registrar informações",
    perguntas: [
      {
        pergunta: "Qual a diferença entre orientação e informação clínica?",
        resposta:
          "Orientação é para o dia a dia da escola e de casa (estratégias, adaptações, o que observar): professor, família e coordenação veem. Informação clínica (medicação, receitas, dados de saúde) só o professor do aluno e a família veem.",
      },
      {
        pergunta: "A inteligência artificial lê o que eu registro?",
        resposta: "Não. Nada do que você registra vai para a IA.",
      },
      {
        pergunta: "Posso apagar um registro?",
        resposta: "Sim, os seus. Registros não são editados depois de enviados, para manter o histórico fiel.",
      },
    ],
  },
} satisfies Record<string, SecaoAjuda>;
