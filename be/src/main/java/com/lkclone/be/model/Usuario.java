package com.lkclone.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "usuario")
@Getter
@Setter
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String userName;

    @Column(unique = true, nullable = false)
    private String userEmail;

    @JsonIgnore
    @Column(nullable = false)
    private String userSenha;
    private String userPfp;
    private String bio;

    @Column(nullable = false)
    private String tema = "escuro";

    @Column(nullable = false)
    private Long perfilVisualizacoes = 0L;

    @Column(nullable = false)
    private boolean emailVerificado = false;

}
