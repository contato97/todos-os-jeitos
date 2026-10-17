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

console.log(`\nResultado: ${ok} ok, ${falhas} falha(s)`);
process.exit(falhas ? 1 : 0);
