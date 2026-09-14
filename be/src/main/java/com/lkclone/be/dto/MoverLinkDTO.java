package com.lkclone.be.dto;

public class MoverLinkDTO {

    // null = tira o link de qualquer grupo (solta ele)
    private Long grupoId;

    public Long getGrupoId() {
        return grupoId;
    }

    public void setGrupoId(Long grupoId) {
        this.grupoId = grupoId;
    }
}
