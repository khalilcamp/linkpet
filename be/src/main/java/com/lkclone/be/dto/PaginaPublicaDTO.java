package com.lkclone.be.dto;

import java.util.List;

public class PaginaPublicaDTO {

    private String userName;
    private String userPfp;
    private String bio;
    private String tema;
    private String corPersonalizada;
    private String fonte;
    private String formatoBotao;
    private String estiloBotao;
    private List<LinkResponseDTO> linksSemGrupo;
    private List<GrupoPublicoDTO> grupos;
    private PetResponseDTO pet;
    private List<String> badges;
    private List<String> tags;
    private boolean captarContato;

    public PaginaPublicaDTO(String userName, String userPfp, String bio, String tema, String corPersonalizada,
                             String fonte, String formatoBotao, String estiloBotao,
                             List<LinkResponseDTO> linksSemGrupo, List<GrupoPublicoDTO> grupos, PetResponseDTO pet,
                             List<String> badges, List<String> tags, boolean captarContato) {
        this.userName = userName;
        this.userPfp = userPfp;
        this.bio = bio;
        this.tema = tema;
        this.corPersonalizada = corPersonalizada;
        this.fonte = fonte;
        this.formatoBotao = formatoBotao;
        this.estiloBotao = estiloBotao;
        this.linksSemGrupo = linksSemGrupo;
        this.grupos = grupos;
        this.pet = pet;
        this.badges = badges;
        this.tags = tags;
        this.captarContato = captarContato;
    }

    public String getUserName() {
        return userName;
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

    public List<LinkResponseDTO> getLinksSemGrupo() {
        return linksSemGrupo;
    }

    public List<GrupoPublicoDTO> getGrupos() {
        return grupos;
    }

    public PetResponseDTO getPet() {
        return pet;
    }

    public List<String> getBadges() {
        return badges;
    }

    public List<String> getTags() {
        return tags;
    }

    public boolean isCaptarContato() {
        return captarContato;
    }
}
