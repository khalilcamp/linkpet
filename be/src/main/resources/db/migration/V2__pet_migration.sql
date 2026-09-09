CREATE TABLE pet (
                     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                     usuario_id BIGINT NOT NULL UNIQUE,
                     especie VARCHAR(30) NOT NULL DEFAULT 'gato',
                     cor VARCHAR(30) NOT NULL DEFAULT 'laranja',
                     xp INTEGER NOT NULL DEFAULT 0,
                     CONSTRAINT fk_pet_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE pet_like_log (
                              id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                              pet_id BIGINT NOT NULL,
                              visitor_id VARCHAR(64) NOT NULL,
                              curtida_data DATE NOT NULL DEFAULT CURRENT_DATE,
                              CONSTRAINT fk_pet_like_log_pet FOREIGN KEY (pet_id) REFERENCES pet(id),
                              CONSTRAINT uq_pet_like_log_pet_visitor_data UNIQUE (pet_id, visitor_id, curtida_data)
);

INSERT INTO pet (usuario_id, especie, cor, xp)
SELECT id, 'gato', 'laranja', 0
FROM usuario u
WHERE NOT EXISTS (SELECT 1 FROM pet p WHERE p.usuario_id = u.id);
