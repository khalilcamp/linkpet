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
    private String fonte;
    private String formatoBotao;
    private String estiloBotao;
    private Long perfilVisualizacoes;
    private boolean emailVerificado;
    private boolean captarContato;
    private String tipoUsuario;
    private List<String> badges;
    private List<String> tags;

    public UsuarioResponseDTO(Long id, String userName, String userEmail, String userPfp, String bio,
                              String tema, String corPersonalizada, String fonte, String formatoBotao, String estiloBotao,
                              Long perfilVisualizacoes, boolean emailVerificado, boolean captarContato, String tipoUsuario,
                              List<String> badges, List<String> tags) {
        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPfp = userPfp;
        this.bio = bio;
        this.tema = tema;
        this.corPersonalizada = corPersonalizada;
        this.fonte = fonte;
        this.formatoBotao = formatoBotao;
        this.estiloBotao = estiloBotao;
        this.perfilVisualizacoes = perfilVisualizacoes;
        this.emailVerificado = emailVerificado;
        this.captarContato = captarContato;
        this.tipoUsuario = tipoUsuario;
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

    public String getFonte() {
        return fonte;
    }

    public String getFormatoBotao() {
        return formatoBotao;
    }

    public String getEstiloBotao() {
        return estiloBotao;
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

    public String getTipoUsuario() {
        return tipoUsuario;
    }

    public List<String> getBadges() {
        return badges;
    }

    public List<String> getTags() {
        return tags;
    }
}
