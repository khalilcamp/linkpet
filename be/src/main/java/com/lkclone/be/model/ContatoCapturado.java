package com.lkclone.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Lead deixado por um visitante da página pública, via bloco opcional de
// captura de contato. Só o dono do perfil vê essa lista (nunca é exposta
// publicamente).
@Entity
@Getter
@Setter
@Table(name = "contato_capturado")
public class ContatoCapturado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String whatsapp;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
