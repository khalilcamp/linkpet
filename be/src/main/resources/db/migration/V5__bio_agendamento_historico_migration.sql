ALTER TABLE usuario ADD COLUMN bio VARCHAR(280);

ALTER TABLE link_usuario ADD COLUMN data_inicio DATE;
ALTER TABLE link_usuario ADD COLUMN data_fim DATE;

CREATE TABLE link_clique_log (
                                 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                 link_id BIGINT NOT NULL,
                                 data DATE NOT NULL DEFAULT CURRENT_DATE,
                                 quantidade BIGINT NOT NULL DEFAULT 0,
                                 CONSTRAINT fk_link_clique_log_link FOREIGN KEY (link_id) REFERENCES link_usuario(link_id),
                                 CONSTRAINT uq_link_clique_log_link_data UNIQUE (link_id, data)
);
