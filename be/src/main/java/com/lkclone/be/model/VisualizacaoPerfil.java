package com.lkclone.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Um evento por visita à página pública — base dos analytics mais fundos
// (origem do tráfego, dispositivo, país). usuario.perfilVisualizacoes
// continua sendo o contador simples já existente; essa tabela é o detalhe.
@Entity
@Getter
@Setter
@Table(name = "visualizacao_perfil")
public class VisualizacaoPerfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    // Host de referência (ex: "instagram.com") ou null = acesso direto.
    private String origem;

    // "mobile" | "tablet" | "desktop"
    @Column(nullable = false)
    private String dispositivo;

    // Código do país (ex: "BR"), preenchido de forma assíncrona e best-effort
    // — pode ficar null se a consulta de geolocalização falhar.
    private String pais;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
