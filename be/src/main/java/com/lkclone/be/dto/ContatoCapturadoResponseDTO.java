package com.lkclone.be.dto;

import java.time.LocalDateTime;

public class ContatoCapturadoResponseDTO {

    private Long id;
    private String email;
    private String whatsapp;
    private LocalDateTime criadoEm;

    public ContatoCapturadoResponseDTO(Long id, String email, String whatsapp, LocalDateTime criadoEm) {
        this.id = id;
        this.email = email;
        this.whatsapp = whatsapp;
        this.criadoEm = criadoEm;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
