// Testa as migrations e as regras de acesso (RLS) num Postgres local (PGlite).
// Rode com: npm run test:db
// simulando o minimo do Supabase (auth, storage, papeis anon/authenticated).
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";

const projeto = process.argv[2];
const db = new PGlite();

// ---------- Simulacao do Supabase ----------
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create schema storage;
  grant usage on schema auth, storage, public to anon, authenticated;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  grant execute on function auth.uid(), auth.jwt() to anon, authenticated;
  create table storage.buckets (id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant select, insert, delete on storage.objects to authenticated;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  grant execute on function storage.foldername(text) to authenticated;
  -- Permissoes padrao que o Supabase da aos papeis
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
`);

for (const arq of fs.readdirSync(path.join(projeto, "supabase/migrations")).sort()) {
  try {
    await db.exec(fs.readFileSync(path.join(projeto, "supabase/migrations", arq), "utf8"));
  } catch (e) {
    console.log("ERRO na migration", arq, "->", e.message, e.position ? `(posicao ${e.position})` : "");
    process.exit(1);
  }
  console.log("migration aplicada:", arq);
}

// ---------- Ajudantes ----------
let ok = 0, falhas = 0;
function confere(nome, condicao, extra = "") {
  if (condicao) { ok++; console.log("  ok   ", nome); }
  else { falhas++; console.log("  FALHA", nome, extra); }
}

async function comoUsuario(usuario, sql, params = []) {
  return db.transaction(async (tx) => {
    if (usuario) {
      await tx.exec(`set local role authenticated`);
      await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [usuario.id]);
      await tx.query(`select set_config('request.jwt.claims', $1, true)`,
        [JSON.stringify({ sub: usuario.id, email: usuario.email })]);
    } else {
      await tx.exec(`set local role anon`);
    }
    return (await tx.query(sql, params)).rows;
  });
}

async function deveFalhar(nome, usuario, sql, params = []) {
  try { await comoUsuario(usuario, sql, params); confere(nome, false, "(deveria ter sido bloqueado)"); }
  catch { confere(nome, true); }
}

async function criarConta(email, dados) {
  const id = crypto.randomUUID();
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`,
    [id, email, JSON.stringify(dados)]);
  return { id, email };
}

// ---------- Cadastro ----------
console.log("\nCadastro");
const profA = await criarConta("a@teste.com", { tipo: "professor", nome: "Prof A", escola: "Escola X",
  rede: "publica", etapas: ["fundamental_1"], atuacao: "polivalente" });
const profB = await criarConta("b@teste.com", { tipo: "professor", nome: "Prof B", escola: "Escola Y",
  rede: "privada", etapas: ["fundamental_2", "medio"], atuacao: "especialista" });
const escola = await criarConta("e@teste.com", { tipo: "escola", nome: "Diretora", escola: "Escola X", cargo: "direcao" });
confere("professor tem linha em professores",
  (await db.query(`select 1 from professores where id = $1`, [profA.id])).rows.length === 1);
confere("escola criada com cargo",
  (await db.query(`select cargo_responsavel from escolas where responsavel_id = $1`, [escola.id])).rows[0]?.cargo_responsavel === "direcao");
try { await criarConta("x@teste.com", { tipo: "familia", nome: "Intrusa" }); confere("familia sem convite e recusada", false); }
catch { confere("familia sem convite e recusada", true); }
try { await criarConta("y@teste.com", { tipo: "professor", nome: "P", escola: "E", rede: "x", etapas: ["infantil"], atuacao: "polivalente" }); confere("rede invalida e recusada", false); }
catch { confere("rede invalida e recusada", true); }
try { await criarConta("z@teste.com", { tipo: "professor", nome: "P", escola: "E", rede: "publica", etapas: [], atuacao: "polivalente" }); confere("sem etapa e recusado", false); }
catch { confere("sem etapa e recusado", true); }

// ---------- Alunos ----------
console.log("\nAlunos");
const [aluno] = await comoUsuario(profA, `insert into alunos (nome, interesses) values ('Lia', 'dinossauros') returning id`);
await comoUsuario(profA, `insert into alunos_saude (aluno_id, informacoes) values ($1, 'laudo informado')`, [aluno.id]);
confere("professor A ve o proprio aluno", (await comoUsuario(profA, `select * from alunos`)).length === 1);
confere("professor B NAO ve aluno de A", (await comoUsuario(profB, `select * from alunos`)).length === 0);
confere("professor B NAO ve saude do aluno de A", (await comoUsuario(profB, `select * from alunos_saude`)).length === 0);
await deveFalhar("professor B nao cria aluno em nome de A", profB,
  `insert into alunos (nome, professor_id) values ('X', $1)`, [profA.id]);
const editado = await comoUsuario(profB, `update alunos set nome = 'Hack' where id = $1 returning id`, [aluno.id]);
confere("professor B nao edita aluno de A", editado.length === 0);
await deveFalhar("professor A nao transfere aluno para B", profA,
  `update alunos set professor_id = $1 where id = $2`, [profB.id, aluno.id]);
await deveFalhar("visitante deslogado nao le alunos", null, `select * from alunos`);

// ---------- Convite da familia ----------
console.log("\nFamilia");
await deveFalhar("professor B nao convida familia para aluno de A", profB,
  `insert into convites (tipo, email, aluno_id) values ('familia', 'mae@teste.com', $1)`, [aluno.id]);
const [convite] = await comoUsuario(profA,
  `insert into convites (tipo, email, aluno_id, parentesco) values ('familia', 'mae@teste.com', $1, 'mãe') returning token`, [aluno.id]);
try { await criarConta("outra@teste.com", { tipo: "familia", nome: "Outra", convite: convite.token }); confere("convite nao vale para outro e-mail", false); }
catch { confere("convite nao vale para outro e-mail", true); }
const mae = await criarConta("mae@teste.com", { tipo: "familia", nome: "Mãe da Lia", convite: convite.token });
confere("familia criada pelo convite",
  (await db.query(`select tipo from perfis where id = $1`, [mae.id])).rows[0]?.tipo === "familia");
try { await criarConta("mae2@teste.com", { tipo: "familia", nome: "X", convite: convite.token }); confere("convite nao pode ser usado duas vezes", false); }
catch { confere("convite nao pode ser usado duas vezes", true); }
confere("antes do consentimento a familia NAO ve o aluno", (await comoUsuario(mae, `select * from alunos`)).length === 0);
await comoUsuario(mae, `select registrar_consentimento($1)`, [aluno.id]);
confere("depois do consentimento a familia ve o filho", (await comoUsuario(mae, `select * from alunos`)).length === 1);
confere("familia NAO ve dados de saude", (await comoUsuario(mae, `select * from alunos_saude`)).length === 0);
confere("familia ve o nome do professor",
  (await comoUsuario(mae, `select nome from perfis where id = $1`, [profA.id])).length === 1);
confere("professor ve o nome da familia",
  (await comoUsuario(profA, `select nome from perfis where id = $1`, [mae.id])).length === 1);
confere("professor B NAO ve o nome da familia",
  (await comoUsuario(profB, `select nome from perfis where id = $1`, [mae.id])).length === 0);

// ---------- Observacoes ----------
console.log("\nObservacoes");
await comoUsuario(profA, `insert into observacoes (aluno_id, origem, texto) values ($1, 'escola', 'anotacao interna')`, [aluno.id]);
await comoUsuario(profA, `insert into observacoes (aluno_id, origem, texto, visivel_familia) values ($1, 'escola', 'compartilhada', true)`, [aluno.id]);
await comoUsuario(mae, `insert into observacoes (aluno_id, origem, texto) values ($1, 'casa', 'fez a licao sozinha')`, [aluno.id]);
const obsMae = await comoUsuario(mae, `select texto from observacoes order by texto`);
confere("familia ve so a compartilhada e a propria", obsMae.map((o) => o.texto).join("|") === "compartilhada|fez a licao sozinha", JSON.stringify(obsMae));
confere("professor ve as 3, inclusive a de casa", (await comoUsuario(profA, `select * from observacoes`)).length === 3);
await deveFalhar("familia nao registra como se fosse a escola", mae,
  `insert into observacoes (aluno_id, origem, texto) values ($1, 'escola', 'x')`, [aluno.id]);
const obsEditada = await comoUsuario(mae, `update observacoes set texto = 'mudei' where origem = 'escola' returning id`);
confere("familia nao edita observacao do professor", obsEditada.length === 0);
await deveFalhar("professor nao muda a autoria", profA, `update observacoes set autor_id = $1`, [mae.id]);

// ---------- Atividades e relatorios ----------
console.log("\nAtividades e relatorios");
await deveFalhar("rascunho nao pode ser compartilhado", profA,
  `insert into atividades (aluno_id, titulo, compartilhado_com_familia) values ($1, 'T', true)`, [aluno.id]);
await comoUsuario(profA, `insert into atividades (aluno_id, titulo) values ($1, 'Rascunho')`, [aluno.id]);
await comoUsuario(profA, `insert into atividades (aluno_id, titulo, status, compartilhado_com_familia) values ($1, 'Pronta', 'revisado', true)`, [aluno.id]);
confere("familia ve so a atividade revisada e compartilhada",
  (await comoUsuario(mae, `select titulo from atividades`)).map((a) => a.titulo).join() === "Pronta");
await comoUsuario(profA, `insert into relatorios (aluno_id, periodo_inicio, periodo_fim, versao_familia, versao_tecnica, status, compartilhado_com_familia)
  values ($1, '2026-08-01', '2026-09-30', 'texto acolhedor', 'texto tecnico', 'revisado', true)`, [aluno.id]);
confere("familia NAO le a tabela de relatorios direto", (await comoUsuario(mae, `select * from relatorios`)).length === 0);
const relMae = await comoUsuario(mae, `select * from relatorios_para_familia($1)`, [aluno.id]);
confere("familia recebe so a versao acolhedora",
  relMae.length === 1 && relMae[0].versao_familia === "texto acolhedor" && !("versao_tecnica" in relMae[0]));
confere("professor B nao recebe relatorio pela funcao",
  (await comoUsuario(profB, `select * from relatorios_para_familia($1)`, [aluno.id])).length === 0);

// ---------- Reforco ----------
console.log("\nReforco");
await comoUsuario(mae, `insert into reforcos (aluno_id, tipo, pedido) values ($1, 'licao', 'ajuda com fracoes')`, [aluno.id]);
confere("professor acompanha o reforco de casa", (await comoUsuario(profA, `select * from reforcos`)).length === 1);
confere("professor B nao ve o reforco", (await comoUsuario(profB, `select * from reforcos`)).length === 0);

// ---------- Escola ----------
console.log("\nEscola");
const [esc] = await db.query(`select id from escolas where responsavel_id = $1`, [escola.id]).then((r) => r.rows);
confere("escola sem vinculo NAO ve alunos", (await comoUsuario(escola, `select * from alunos`)).length === 0);
await deveFalhar("professor nao se vincula sozinho a escola", profA,
  `insert into escola_professores (escola_id, professor_id) values ($1, $2)`, [esc.id, profA.id]);
await deveFalhar("professor nao cria convite em nome da escola", profA,
  `insert into convites (tipo, email, escola_id) values ('professor', 'a@teste.com', $1)`, [esc.id]);
const [convProf] = await comoUsuario(escola,
  `insert into convites (tipo, email, escola_id) values ('professor', 'a@teste.com', $1) returning token`, [esc.id]);
await deveFalhar("professor B nao aceita convite de outro e-mail", profB, `select aceitar_convite($1)`, [convProf.token]);
await comoUsuario(profA, `select aceitar_convite($1)`, [convProf.token]);
confere("professor ve a escola a que pertence", (await comoUsuario(profA, `select nome from escolas`)).length === 1);
confere("escola ve o aluno do professor vinculado", (await comoUsuario(escola, `select * from alunos`)).length === 1);
confere("escola ve so atividade revisada",
  (await comoUsuario(escola, `select titulo from atividades`)).map((a) => a.titulo).join() === "Pronta");
confere("escola NAO ve dados de saude", (await comoUsuario(escola, `select * from alunos_saude`)).length === 0);
confere("escola NAO ve observacoes", (await comoUsuario(escola, `select * from observacoes`)).length === 0);
confere("escola ve dados do professor", (await comoUsuario(escola, `select * from professores`)).length === 1);
const escEdita = await comoUsuario(escola, `update alunos set nome = 'x' returning id`).catch(() => []);
confere("escola NAO edita aluno", escEdita.length === 0);
confere("escola NAO ve aluno de professor nao vinculado (B)",
  (await comoUsuario(escola, `select * from alunos where professor_id = $1`, [profB.id])).length === 0);

// ---------- Storage ----------
console.log("\nArquivos");
await comoUsuario(profA, `insert into storage.objects (bucket_id, name) values ('atividades', $1)`, [`${profA.id}/prova.pdf`]);
confere("professor envia para a propria pasta", true);
await deveFalhar("professor nao envia para a pasta de outro", profA,
  `insert into storage.objects (bucket_id, name) values ('atividades', $1)`, [`${profB.id}/prova.pdf`]);
confere("professor B nao ve arquivo de A", (await comoUsuario(profB, `select * from storage.objects`)).length === 0);

// ---------- Convite visto pelo link e boas-vindas ----------
console.log("\nConvite pelo link e boas-vindas");
const [novoConvite] = await comoUsuario(profA,
  `insert into convites (tipo, email, aluno_id) values ('familia', 'pai.da.lia@teste.com', $1) returning token`, [aluno.id]);
const [visto] = await comoUsuario(null, `select * from ver_convite($1)`, [novoConvite.token]);
confere("visitante ve que o convite e valido", visto?.valido === true && visto.tipo === "familia");
confere("e-mail aparece mascarado", visto?.email_dica === "pa***@teste.com", visto?.email_dica);
confere("aparece so o primeiro nome do aluno", visto?.aluno_primeiro_nome === "Lia");
const [usado] = await comoUsuario(null, `select * from ver_convite($1)`, [convite.token]);
confere("convite ja usado aparece como invalido", usado?.valido === false);
confere("token inexistente nao devolve nada",
  (await comoUsuario(null, `select * from ver_convite($1)`, [crypto.randomUUID()])).length === 0);
await deveFalhar("visitante nao le a tabela de convites", null, `select * from convites`);
const [primeira] = await comoUsuario(profA, `select marcar_boas_vindas() as enviar`);
const [segunda] = await comoUsuario(profA, `select marcar_boas_vindas() as enviar`);
confere("boas-vindas so na primeira vez", primeira.enviar === true && segunda.enviar === false);

// ---------- Consentimento pendente ----------
console.log("\nConsentimento pendente");
const tia = await criarConta("pai.da.lia@teste.com", { tipo: "familia", nome: "Pai da Lia", convite: novoConvite.token });
const pend = await comoUsuario(tia, `select * from consentimentos_pendentes()`);
confere("familia ve so o primeiro nome antes de consentir", pend.length === 1 && pend[0].primeiro_nome === "Lia");
confere("a ficha completa continua bloqueada", (await comoUsuario(tia, `select * from alunos`)).length === 0);
confere("professor nao tem pendencias de familia", (await comoUsuario(profA, `select * from consentimentos_pendentes()`)).length === 0);

// ---------- Minha conta ----------
console.log("\nMinha conta");
await comoUsuario(profA, `update perfis set nome = 'Ana Prof', foto = $1 where id = $2`, [`${profA.id}/perfil.webp`, profA.id]);
confere("professor edita o proprio nome e foto",
  (await db.query(`select nome from perfis where id = $1`, [profA.id])).rows[0].nome === "Ana Prof");
await deveFalhar("ninguem troca o proprio tipo de perfil", profA, `update perfis set tipo = 'escola' where id = $1`, [profA.id]);
const editouOutro = await comoUsuario(profA, `update perfis set nome = 'x' where id = $1 returning id`, [profB.id]);
confere("professor nao edita o perfil de outro", editouOutro.length === 0);
await comoUsuario(profA, `update professores set escola_nome = 'Escola Nova', etapas = '{medio}' where id = $1`, [profA.id]);
confere("professor edita os proprios dados de cadastro",
  (await db.query(`select escola_nome from professores where id = $1`, [profA.id])).rows[0].escola_nome === "Escola Nova");
await deveFalhar("etapa invalida e recusada", profA, `update professores set etapas = '{faculdade}' where id = $1`, [profA.id]);
await comoUsuario(profA, `insert into storage.objects (bucket_id, name) values ('fotos', $1)`, [`${profA.id}/perfil.webp`]);
confere("professor envia a propria foto", true);
await deveFalhar("ninguem envia foto na pasta de outro", profB,
  `insert into storage.objects (bucket_id, name) values ('fotos', $1)`, [`${profA.id}/x.webp`]);

// ---------- Documentos do aluno (dado sensivel) ----------
console.log("\nDocumentos do aluno");
await comoUsuario(profA, `insert into alunos_documentos (aluno_id, nome_original, caminho, tipo, tamanho)
  values ($1, 'laudo.pdf', $2, 'application/pdf', 1000)`, [aluno.id, `${profA.id}/${aluno.id}/laudo.pdf`]);
confere("professor ve o documento do proprio aluno", (await comoUsuario(profA, `select * from alunos_documentos`)).length === 1);
confere("outro professor NAO ve", (await comoUsuario(profB, `select * from alunos_documentos`)).length === 0);
confere("familia NAO ve (mesmo com consentimento)", (await comoUsuario(mae, `select * from alunos_documentos`)).length === 0);
confere("escola NAO ve (mesmo vinculada)", (await comoUsuario(escola, `select * from alunos_documentos`)).length === 0);
await deveFalhar("outro professor nao anexa documento no aluno de A", profB,
  `insert into alunos_documentos (aluno_id, nome_original, caminho, tipo, tamanho, professor_id)
   values ($1, 'x.pdf', 'x/x.pdf', 'application/pdf', 1, $2)`, [aluno.id, profB.id]);
await deveFalhar("professor nao troca o arquivo de um documento", profA, `update alunos_documentos set caminho = 'outro'`);
await comoUsuario(profA, `insert into storage.objects (bucket_id, name) values ('documentos', $1)`, [`${profA.id}/${aluno.id}/laudo.pdf`]);
confere("familia NAO acessa o arquivo no storage",
  (await comoUsuario(mae, `select * from storage.objects where bucket_id = 'documentos'`)).length === 0);

// ---------- Reforco especializado ----------
console.log("\nReforco especializado");
await comoUsuario(mae, `insert into reforcos (aluno_id, tipo, materia, tema, tempo_minutos, pedido)
  values ($1, 'material', 'Matemática', 'frações', 20, 'material com pizza')`, [aluno.id]);
confere("familia pede material de uma materia", (await comoUsuario(mae, `select * from reforcos where tipo = 'material'`)).length === 1);
await deveFalhar("tipo desconhecido e recusado", mae,
  `insert into reforcos (aluno_id, tipo, pedido) values ($1, 'prova', 'x')`, [aluno.id]);
await deveFalhar("tempo fora do limite e recusado", mae,
  `insert into reforcos (aluno_id, tipo, tempo_minutos, pedido) values ($1, 'reforco', 300, 'x')`, [aluno.id]);
confere("professor ve o pedido especializado", (await comoUsuario(profA, `select * from reforcos where tipo = 'material'`)).length === 1);

// ---------- Resumo da escola (so contagens) ----------
console.log("\nResumo da escola");
const resumoProf = await comoUsuario(escola, `select * from resumo_escola_professores()`);
confere("escola ve o resumo do professor vinculado", resumoProf.length === 1 && resumoProf[0].professor_id === profA.id);
confere("resumo conta alunos e observacoes", resumoProf[0]?.alunos === 1 && resumoProf[0]?.observacoes_30d >= 3, JSON.stringify(resumoProf[0]));
confere("resumo conta familia conectada", resumoProf[0]?.familias_conectadas === 1);
const resumoAlunos = await comoUsuario(escola, `select * from resumo_escola_alunos()`);
confere("escola ve o resumo por aluno", resumoAlunos.length === 1 && resumoAlunos[0].familia_conectada === true);
confere("resumo por aluno nao traz texto nenhum", !Object.values(resumoAlunos[0]).some((v) => typeof v === "string" && v.length > 40));
confere("professor B (nao e escola) recebe resumo vazio", (await comoUsuario(profB, `select * from resumo_escola_professores()`)).length === 0);
confere("familia recebe resumo vazio", (await comoUsuario(mae, `select * from resumo_escola_alunos()`)).length === 0);
await deveFalhar("visitante nao chama o resumo", null, `select * from resumo_escola_alunos()`);


// ---------- WhatsApp e atuacao mista ----------
console.log("\nWhatsApp e atuacao mista");
const profC = await criarConta("c@teste.com", { tipo: "professor", nome: "Prof C", escola: "Escola Z",
  whatsapp: "(11) 91234-5678", rede: "ambas", etapas: ["infantil"], atuacao: "ambos" });
confere("professor nas duas redes e nas duas atuacoes",
  (await db.query(`select rede, atuacao from professores where id = $1`, [profC.id])).rows[0]?.rede === "ambas");
confere("whatsapp guardado so com digitos",
  (await db.query(`select whatsapp from perfis where id = $1`, [profC.id])).rows[0]?.whatsapp === "11912345678");
await deveFalhar("whatsapp invalido e recusado", profC, `update perfis set whatsapp = '123' where id = $1`, [profC.id]);
confere("professor edita o proprio whatsapp",
  (await comoUsuario(profC, `update perfis set whatsapp = '11999998888' where id = $1 returning id`, [profC.id])).length === 1);

// ---------- Como e em casa (familia) ----------
console.log("\nComo e em casa");
await comoUsuario(mae, `insert into aluno_casa (aluno_id, como_em_casa, medicacoes) values ($1, 'calma de manha', 'remedio X 1x ao dia')`, [aluno.id]);
confere("familia ve a propria ficha", (await comoUsuario(mae, `select * from aluno_casa`)).length === 1);
confere("familia edita a propria ficha",
  (await comoUsuario(mae, `update aluno_casa set rotina_estudo = 'depois do lanche' where aluno_id = $1 returning aluno_id`, [aluno.id])).length === 1);
confere("professor do aluno le a ficha", (await comoUsuario(profA, `select medicacoes from aluno_casa`)).length === 1);
confere("professor B NAO le a ficha", (await comoUsuario(profB, `select * from aluno_casa`)).length === 0);
confere("escola NAO le a ficha (tem saude)", (await comoUsuario(escola, `select * from aluno_casa`)).length === 0);
confere("professor NAO edita a ficha da familia",
  (await comoUsuario(profA, `update aluno_casa set como_em_casa = 'x' returning aluno_id`)).length === 0);
await deveFalhar("familia sem consentimento NAO preenche", tia,
  `insert into aluno_casa (aluno_id, como_em_casa) values ($1, 'x')`, [aluno.id]);
await deveFalhar("familia NAO preenche em nome de outra", mae,
  `insert into aluno_casa (aluno_id, familia_id, como_em_casa) values ($1, $2, 'x')`, [aluno.id, tia.id]);
await deveFalhar("visitante NAO le a ficha", null, `select * from aluno_casa`);

// ---------- Dicas do professor para a familia ----------
console.log("\nDicas para a familia");
const [ativ] = await comoUsuario(profA,
  `insert into atividades (aluno_id, titulo, conteudo_adaptado, status, compartilhado_com_familia) values ($1, 'Soma', 'conteudo', 'revisado', true) returning id`, [aluno.id]);
confere("professor escreve dicas para a familia",
  (await comoUsuario(profA, `update atividades set dicas_familia = 'use feijoes' where id = $1 returning id`, [ativ.id])).length === 1);
confere("familia le as dicas", (await comoUsuario(mae, `select dicas_familia from atividades where id = $1`, [ativ.id]))[0]?.dicas_familia === "use feijoes");
confere("familia NAO edita as dicas",
  (await comoUsuario(mae, `update atividades set dicas_familia = 'x' where id = $1 returning id`, [ativ.id]).catch(() => [])).length === 0);


// ---------- Especialista ----------
console.log("\nEspecialista");
const dadosEsp = { tipo: "especialista", nome: "Dra. Ana", whatsapp: "11988887777", profissao: "terapeuta_ocupacional",
  registro: "CREFITO 123", clinica: "Clinica Brincar", local: "Sao Paulo - SP", atuacao: "Terapia ocupacional infantil" };
try { await criarConta("intrusa.esp@teste.com", { ...dadosEsp }); confere("especialista sem convite e recusado", false); }
catch { confere("especialista sem convite e recusado", true); }
await deveFalhar("professor NAO convida especialista", profA,
  `insert into convites (tipo, email, escola_id) values ('especialista', 'ana@teste.com', $1)`, [esc.id]);
const [convEsp] = await comoUsuario(escola,
  `insert into convites (tipo, email, escola_id) values ('especialista', 'ana@teste.com', $1) returning token`, [esc.id]);
try { await criarConta("ana@teste.com", { ...dadosEsp, tipo: "familia", convite: convEsp.token }); confere("convite de especialista nao vira familia", false); }
catch { confere("convite de especialista nao vira familia", true); }
const ana = await criarConta("ana@teste.com", { ...dadosEsp, convite: convEsp.token });
confere("especialista criado pelo convite",
  (await db.query(`select p.tipo, e.clinica from perfis p join especialistas e on e.id = p.id where p.id = $1`, [ana.id])).rows[0]?.tipo === "especialista");
confere("especialista ja entra vinculado a escola",
  (await comoUsuario(ana, `select * from escola_especialistas`)).length === 1);
confere("especialista ve a escola", (await comoUsuario(ana, `select nome from escolas`)).length === 1);
confere("especialista sem vinculo de aluno NAO ve alunos", (await comoUsuario(ana, `select * from alunos`)).length === 0);
confere("escola ve os dados do especialista", (await comoUsuario(escola, `select clinica from especialistas`)).length === 1);
confere("professor B NAO ve o especialista", (await comoUsuario(profB, `select * from especialistas`)).length === 0);

await deveFalhar("professor NAO vincula especialista a aluno", profA,
  `insert into especialista_alunos (aluno_id, especialista_id, escola_id) values ($1, $2, $3)`, [aluno.id, ana.id, esc.id]);
await deveFalhar("especialista NAO se vincula sozinho ao aluno", ana,
  `insert into especialista_alunos (aluno_id, especialista_id, escola_id) values ($1, $2, $3)`, [aluno.id, ana.id, esc.id]);
const [alunoB] = await comoUsuario(profB, `insert into alunos (nome) values ('Teo') returning id`);
await deveFalhar("escola NAO vincula aluno de professor de fora", escola,
  `insert into especialista_alunos (aluno_id, especialista_id, escola_id) values ($1, $2, $3)`, [alunoB.id, ana.id, esc.id]);
await comoUsuario(escola,
  `insert into especialista_alunos (aluno_id, especialista_id, escola_id, ver_relatorios) values ($1, $2, $3, false)`, [aluno.id, ana.id, esc.id]);
confere("especialista ve o aluno vinculado", (await comoUsuario(ana, `select nome from alunos`)).length === 1);
confere("especialista NAO ve saude do aluno", (await comoUsuario(ana, `select * from alunos_saude`)).length === 0);
confere("especialista NAO ve observacoes", (await comoUsuario(ana, `select * from observacoes`)).length === 0);
confere("especialista NAO ve a ficha de casa", (await comoUsuario(ana, `select * from aluno_casa`)).length === 0);
await comoUsuario(profA,
  `insert into relatorios (aluno_id, periodo_inicio, periodo_fim, versao_familia, versao_tecnica, status) values ($1, '2026-08-01', '2026-09-30', 'f', 't', 'revisado')`, [aluno.id]);
confere("sem permissao, especialista NAO ve relatorios", (await comoUsuario(ana, `select * from relatorios`)).length === 0);
await comoUsuario(escola, `update especialista_alunos set ver_relatorios = true where aluno_id = $1`, [aluno.id]);
const relsAna = await comoUsuario(ana, `select status from relatorios`);
confere("com permissao, especialista ve so relatorios revisados", relsAna.length >= 1 && relsAna.every((r) => r.status === "revisado"));
confere("especialista ve o nome do professor", (await comoUsuario(ana, `select nome from perfis where id = $1`, [profA.id])).length === 1);
confere("professor ve o nome do especialista", (await comoUsuario(profA, `select nome from perfis where id = $1`, [ana.id])).length === 1);
confere("familia ve quem acompanha o filho", (await comoUsuario(mae, `select * from especialista_alunos`)).length === 1);

await comoUsuario(ana, `insert into especialista_registros (aluno_id, tipo, texto) values ($1, 'orientacao', 'usar pausas sensoriais')`, [aluno.id]);
await comoUsuario(ana, `insert into especialista_registros (aluno_id, tipo, texto) values ($1, 'clinico', 'medicacao X')`, [aluno.id]);
await deveFalhar("especialista NAO registra em aluno que nao acompanha", ana,
  `insert into especialista_registros (aluno_id, tipo, texto) values ($1, 'orientacao', 'x')`, [alunoB.id]);
await deveFalhar("especialista NAO registra em nome de outro", ana,
  `insert into especialista_registros (aluno_id, especialista_id, tipo, texto) values ($1, $2, 'orientacao', 'x')`, [aluno.id, profA.id]);
confere("professor ve os dois registros", (await comoUsuario(profA, `select * from especialista_registros`)).length === 2);
confere("familia ve os dois registros", (await comoUsuario(mae, `select * from especialista_registros`)).length === 2);
confere("escola ve so a orientacao (nao o clinico)",
  (await comoUsuario(escola, `select tipo from especialista_registros`)).map((r) => r.tipo).join() === "orientacao");
confere("professor B NAO ve registros", (await comoUsuario(profB, `select * from especialista_registros`)).length === 0);
confere("especialista NAO edita registro",
  (await comoUsuario(ana, `update especialista_registros set texto = 'x' returning id`).catch(() => [])).length === 0);
await comoUsuario(escola, `update especialista_alunos set pode_registrar = false where aluno_id = $1`, [aluno.id]);
await deveFalhar("sem permissao, especialista NAO registra", ana,
  `insert into especialista_registros (aluno_id, tipo, texto) values ($1, 'orientacao', 'x')`, [aluno.id]);

// Se o professor sai da escola, o especialista perde o acesso ao aluno
await db.query(`delete from escola_professores where professor_id = $1`, [profA.id]);
confere("professor saiu da escola: especialista NAO ve mais o aluno", (await comoUsuario(ana, `select * from alunos`)).length === 0);
await db.query(`insert into escola_professores (escola_id, professor_id) values ($1, $2)`, [esc.id, profA.id]);
// Escola desvincula o especialista: acompanhamentos caem juntos
await comoUsuario(escola, `delete from escola_especialistas where especialista_id = $1`, [ana.id]);
confere("escola desvinculou: acompanhamentos apagados", (await db.query(`select * from especialista_alunos`)).rows.length === 0);
confere("escola desvinculou: especialista NAO ve o aluno", (await comoUsuario(ana, `select * from alunos`)).length === 0);
confere("registros continuam para o professor", (await comoUsuario(profA, `select * from especialista_registros`)).length === 2);
// Segundo convite, com conta ja existente
const [convEsp2] = await comoUsuario(escola,
  `insert into convites (tipo, email, escola_id) values ('especialista', 'ana@teste.com', $1) returning token`, [esc.id]);
await deveFalhar("professor NAO aceita convite de especialista", profA, `select aceitar_convite($1)`, [convEsp2.token]);
const [aceito] = await comoUsuario(ana, `select aceitar_convite($1) as tipo`, [convEsp2.token]);
confere("especialista aceita novo convite logado", aceito?.tipo === "especialista");


// ---------- WhatsApp e privado ----------
console.log("\nWhatsApp privado");
await deveFalhar("familia NAO le o WhatsApp do professor", mae, `select whatsapp from perfis where id = $1`, [profA.id]);
await deveFalhar("escola NAO le o WhatsApp do professor", escola, `select whatsapp from perfis where id = $1`, [profA.id]);
confere("familia ainda ve o nome do professor", (await comoUsuario(mae, `select nome from perfis where id = $1`, [profA.id])).length === 1);
confere("cada um le o proprio WhatsApp pela funcao",
  (await comoUsuario(profC, `select meu_whatsapp() as w`))[0]?.w === "11999998888");
await deveFalhar("visitante nao chama meu_whatsapp", null, `select meu_whatsapp()`);

console.log(`\nResultado: ${ok} ok, ${falhas} falha(s)`);
process.exit(falhas ? 1 : 0);
