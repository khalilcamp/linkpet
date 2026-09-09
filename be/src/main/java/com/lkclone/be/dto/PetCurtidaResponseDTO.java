package com.lkclone.be.dto;

public class PetCurtidaResponseDTO {

    private int xp;
    private int nivel;
    private int estagioVisual;
    private boolean jaCurtiuHoje;

    public PetCurtidaResponseDTO(int xp, int nivel, int estagioVisual, boolean jaCurtiuHoje) {
        this.xp = xp;
        this.nivel = nivel;
        this.estagioVisual = estagioVisual;
        this.jaCurtiuHoje = jaCurtiuHoje;
    }

    public int getXp() {
        return xp;
    }

    public int getNivel() {
        return nivel;
    }

    public int getEstagioVisual() {
        return estagioVisual;
    }

    public boolean isJaCurtiuHoje() {
        return jaCurtiuHoje;
    }
}
