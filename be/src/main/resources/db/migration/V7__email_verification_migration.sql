ALTER TABLE usuario ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE email_verification_token (
                                           id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                           usuario_id BIGINT NOT NULL,
                                           token VARCHAR(100) NOT NULL UNIQUE,
                                           expira_em TIMESTAMP NOT NULL,
                                           usado BOOLEAN NOT NULL DEFAULT false,
                                           CONSTRAINT fk_email_verification_token_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
