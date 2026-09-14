ALTER TABLE usuario ADD COLUMN fonte VARCHAR(20) NOT NULL DEFAULT 'padrao';
ALTER TABLE usuario ADD COLUMN formato_botao VARCHAR(20) NOT NULL DEFAULT 'arredondado';
ALTER TABLE usuario ADD COLUMN estilo_botao VARCHAR(20) NOT NULL DEFAULT 'preenchido';
