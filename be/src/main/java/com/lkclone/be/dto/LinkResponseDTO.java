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

    public LinkResponseDTO(Long linkId, String url, String label, String pictureLink, Long position, boolean ativo,
                            Long cliques, LocalDate dataInicio, LocalDate dataFim, Long grupoId) {
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
}
