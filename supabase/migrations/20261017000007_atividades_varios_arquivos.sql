-- Atividades a partir de varios arquivos: fotos, PDF, Word e texto.

-- O bucket passa a aceitar esses formatos (antes era so PDF)
update storage.buckets
set allowed_mime_types = array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    file_size_limit = 10485760
where id = 'atividades';

-- Lista dos arquivos originais (caminhos no Storage). "arquivo_original"
-- continua existindo para as atividades antigas.
alter table public.atividades add column arquivos_originais text[] not null default '{}';

-- O que o professor pediu para a IA priorizar, guardado junto da atividade
alter table public.atividades add column orientacoes text;
