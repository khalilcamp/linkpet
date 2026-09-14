package com.lkclone.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "grupo")
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Long posicao;

    @Column(nullable = false)
    private boolean ativo = true;

    // "lista" (padrão) ou "grid" — grid é exclusivo pra contas
    // Premium/Empresa/Colaborador/Desenvolvedor, checado no GrupoService.
    @Column(nullable = false)
    private String layout = "lista";

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
