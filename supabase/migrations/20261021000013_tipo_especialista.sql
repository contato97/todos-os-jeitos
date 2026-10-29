-- Novo tipo de perfil: especialista (terapeuta, neuro, psicologo...).
-- Fica num arquivo separado porque o Postgres so deixa USAR um valor novo
-- de enum depois que o comando que o criou foi concluido.
alter type public.tipo_perfil add value if not exists 'especialista';
