package com.lkclone.be.dto;

import java.util.List;

public class UsuarioResponseDTO {

    private Long id;
    private String userName;
    private String userEmail;
    private String userPfp;
    private String bio;
    private String tema;
    private String corPersonalizada;
    private Long perfilVisualizacoes;
    private boolean emailVerificado;
    private boolean captarContato;
    private List<String> badges;
    private List<String> tags;

    public UsuarioResponseDTO(Long id, String userName, String userEmail, String userPfp, String bio,
                              String tema, String corPersonalizada, Long perfilVisualizacoes, boolean emailVerificado,
                              boolean captarContato, List<String> badges, List<String> tags) {
        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPfp = userPfp;
        this.bio = bio;
        this.tema = tema;
        this.corPersonalizada = corPersonalizada;
        this.perfilVisualizacoes = perfilVisualizacoes;
        this.emailVerificado = emailVerificado;
        this.captarContato = captarContato;
        this.badges = badges;
        this.tags = tags;
    }

    public Long getId() {
        return id;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getUserPfp() {
        return userPfp;
    }

    public String getBio() {
        return bio;
    }

    public String getTema() {
        return tema;
    }

    public String getCorPersonalizada() {
        return corPersonalizada;
    }

    public Long getPerfilVisualizacoes() {
        return perfilVisualizacoes;
    }

    public boolean isEmailVerificado() {
        return emailVerificado;
    }

    public boolean isCaptarContato() {
        return captarContato;
    }

    public List<String> getBadges() {
        return badges;
    }

    public List<String> getTags() {
        return tags;
    }
}
