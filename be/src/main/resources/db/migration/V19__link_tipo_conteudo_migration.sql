ALTER TABLE link_usuario ADD COLUMN tipo_conteudo VARCHAR(20) NOT NULL DEFAULT 'link';
ALTER TABLE link_usuario ADD COLUMN conteudo TEXT;
ALTER TABLE link_usuario ALTER COLUMN url DROP NOT NULL;
