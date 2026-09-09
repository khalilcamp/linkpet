package com.lkclone.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "pet")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", unique = true, nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private String especie;

    @Column(nullable = false)
    private String cor;

    @Column(nullable = false)
    private int xp;

    @Column(nullable = false)
    private String chapeu;

    @Column(nullable = false)
    private String rosto;

    @Column(name = "acessorio_corpo", nullable = false)
    private String acessorioCorpo;
}
