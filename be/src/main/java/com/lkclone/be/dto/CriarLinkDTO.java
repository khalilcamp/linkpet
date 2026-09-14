package com.lkclone.be.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CriarLinkDTO {

    @NotBlank(message = "{validation.link.url.blank}")
    @Size(max = 2048, message = "{validation.link.url.size}")
    private String url;

    @NotBlank(message = "{validation.link.titulo.blank}")
    @Size(max = 100, message = "{validation.link.titulo.size}")
    private String label;

    @Size(max = 2048, message = "{validation.link.icone.size}")
    private String pictureLink;

    private LocalDate dataInicio;
    private LocalDate dataFim;

    // Opcional: já cria o link dentro de um grupo existente.
    private Long grupoId;

    private boolean exibirComoEmbed;
    private boolean embedCompacto;
    private boolean destaque;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getPictureLink() {
        return pictureLink;
    }

    public void setPictureLink(String pictureLink) {
        this.pictureLink = pictureLink;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public Long getGrupoId() {
        return grupoId;
    }

    public void setGrupoId(Long grupoId) {
        this.grupoId = grupoId;
    }

    public boolean isExibirComoEmbed() {
        return exibirComoEmbed;
    }

    public void setExibirComoEmbed(boolean exibirComoEmbed) {
        this.exibirComoEmbed = exibirComoEmbed;
    }

    public boolean isEmbedCompacto() {
        return embedCompacto;
    }

    public void setEmbedCompacto(boolean embedCompacto) {
        this.embedCompacto = embedCompacto;
    }

    public boolean isDestaque() {
        return destaque;
    }

    public void setDestaque(boolean destaque) {
        this.destaque = destaque;
    }
}
