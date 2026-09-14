package com.lkclone.be.dto;

import java.time.LocalDate;

public class LinkResponseDTO {

    private Long linkId;
    private String url;
    private String label;
    private String pictureLink;
    private Long position;
    private boolean ativo;
    private Long cliques;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private Long grupoId;
    private boolean exibirComoEmbed;
    private boolean embedCompacto;
    private boolean destaque;
    private Integer destaquePosicao;
    private String tipoConteudo;
    private String conteudo;

    public LinkResponseDTO(Long linkId, String url, String label, String pictureLink, Long position, boolean ativo,
                            Long cliques, LocalDate dataInicio, LocalDate dataFim, Long grupoId, boolean exibirComoEmbed,
                            boolean embedCompacto, boolean destaque, Integer destaquePosicao, String tipoConteudo, String conteudo) {
        this.linkId = linkId;
        this.url = url;
        this.label = label;
        this.pictureLink = pictureLink;
        this.position = position;
        this.ativo = ativo;
        this.cliques = cliques;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.grupoId = grupoId;
        this.exibirComoEmbed = exibirComoEmbed;
        this.embedCompacto = embedCompacto;
        this.destaque = destaque;
        this.destaquePosicao = destaquePosicao;
        this.tipoConteudo = tipoConteudo;
        this.conteudo = conteudo;
    }

    public Long getLinkId() {
        return linkId;
    }

    public String getUrl() {
        return url;
    }

    public String getLabel() {
        return label;
    }

    public String getPictureLink() {
        return pictureLink;
    }

    public Long getPosition() {
        return position;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public Long getCliques() {
        return cliques;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public Long getGrupoId() {
        return grupoId;
    }

    public boolean isExibirComoEmbed() {
        return exibirComoEmbed;
    }

    public boolean isEmbedCompacto() {
        return embedCompacto;
    }

    public boolean isDestaque() {
        return destaque;
    }

    public Integer getDestaquePosicao() {
        return destaquePosicao;
    }

    public String getTipoConteudo() {
        return tipoConteudo;
    }

    public String getConteudo() {
        return conteudo;
    }
}
