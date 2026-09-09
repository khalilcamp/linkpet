package com.lkclone.be.dto;

import java.time.LocalDate;

public class LinkCliqueDiaDTO {

    private LocalDate data;
    private Long quantidade;

    public LinkCliqueDiaDTO(LocalDate data, Long quantidade) {
        this.data = data;
        this.quantidade = quantidade;
    }

    public LocalDate getData() {
        return data;
    }

    public Long getQuantidade() {
        return quantidade;
    }
}
