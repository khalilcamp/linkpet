package com.lkclone.be.dto;

public class UsuarioResponseDTO {

    private Long id;
    private String userName;
    private String userEmail;
    private String userPfp;
    private String bio;
    private String tema;
    private Long perfilVisualizacoes;
    private boolean emailVerificado;

    public UsuarioResponseDTO(Long id, String userName, String userEmail, String userPfp, String bio,
                              String tema, Long perfilVisualizacoes, boolean emailVerificado) {
        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPfp = userPfp;
        this.bio = bio;
        this.tema = tema;
        this.perfilVisualizacoes = perfilVisualizacoes;
        this.emailVerificado = emailVerificado;
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

    public Long getPerfilVisualizacoes() {
        return perfilVisualizacoes;
    }

    public boolean isEmailVerificado() {
        return emailVerificado;
    }
}
