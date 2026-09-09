package com.lkclone.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "link_usuario")
public class Link {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long linkId;

    @Column(nullable = false)
    private String url;
    private String pictureLink;

    @Column(nullable = false)
    private Long link_position;

    @Column(nullable = false)
    private String label;
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    private boolean ativo;

    @Column(nullable = false)
    private Long cliques = 0L;

    private LocalDate dataInicio;
    private LocalDate dataFim;

}
