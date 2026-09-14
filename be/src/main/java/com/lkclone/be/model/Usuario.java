package com.lkclone.be.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

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

    // Só usada quando tema = "custom" — formato hex "#rrggbb".
    private String corPersonalizada;

    // Mostra (ou não) o bloco "deixe seu contato" na página pública.
    @Column(nullable = false)
    private boolean captarContato = false;

    @Column(nullable = false)
    private String fonte = "padrao";

    @Column(nullable = false)
    private String formatoBotao = "arredondado";

    @Column(nullable = false)
    private String estiloBotao = "preenchido";

    @Column(nullable = false)
    private Long perfilVisualizacoes = 0L;

    @Column(nullable = false)
    private boolean emailVerificado = false;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "user_badges", columnDefinition = "text[]", nullable = false)
    private List<String> userBadges = new ArrayList<>();

    // Tags auto-declaradas pelo usuário ("Eu sou..."), diferente de userBadges
    // (que são conquistas/concessões manuais). Ver PerfilTagService pro catálogo
    // de valores permitidos.
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "perfil_tags", columnDefinition = "text[]", nullable = false)
    private List<String> perfilTags = new ArrayList<>();

}
