ALTER TABLE usuario ADD COLUMN captar_contato BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE contato_capturado (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    whatsapp VARCHAR(30),
    criado_em TIMESTAMP NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id)
);
