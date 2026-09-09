package com.lkclone.be.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class AtualizarLinkDTO {

    @NotBlank(message = "Informe a URL do link")
    @Size(max = 2048, message = "A URL deve ter no máximo 2048 caracteres")
    private String url;

    @NotBlank(message = "Informe um título para o link")
    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres")
    private String label;

    @Size(max = 2048, message = "A URL do ícone deve ter no máximo 2048 caracteres")
    private String pictureLink;

    private LocalDate dataInicio;
    private LocalDate dataFim;

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
}
