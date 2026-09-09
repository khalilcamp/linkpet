CREATE TABLE usuario (
                         id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                         user_name VARCHAR(50) NOT NULL UNIQUE,
                         user_email VARCHAR(255) NOT NULL UNIQUE,
                         user_senha VARCHAR(255) NOT NULL,
                         user_pfp TEXT
);

CREATE TABLE link_usuario (
                              link_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                              url TEXT NOT NULL,
                              picture_link TEXT,
                              link_position INTEGER NOT NULL,
                              label VARCHAR(100),
                              ativo BOOLEAN NOT NULL DEFAULT true,
                              usuario_id BIGINT NOT NULL,
                              CONSTRAINT fk_link_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);