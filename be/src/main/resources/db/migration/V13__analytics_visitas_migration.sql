CREATE TABLE visualizacao_perfil (
    id BIGSERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL,
    origem VARCHAR(255),
    dispositivo VARCHAR(20) NOT NULL,
    pais VARCHAR(2),
    usuario_id BIGINT NOT NULL REFERENCES usuario(id)
);

CREATE INDEX idx_visualizacao_perfil_usuario_data ON visualizacao_perfil (usuario_id, data_hora);
