package com.lkclone.be.dto;

public class PetResponseDTO {

    private Long petId;
    private String especie;
    private String cor;
    private int xp;
    private int nivel;
    private int estagioVisual;
    private String chapeu;
    private String rosto;
    private String acessorioCorpo;

    public PetResponseDTO(Long petId, String especie, String cor, int xp, int nivel, int estagioVisual,
                           String chapeu, String rosto, String acessorioCorpo) {
        this.petId = petId;
        this.especie = especie;
        this.cor = cor;
        this.xp = xp;
        this.nivel = nivel;
        this.estagioVisual = estagioVisual;
        this.chapeu = chapeu;
        this.rosto = rosto;
        this.acessorioCorpo = acessorioCorpo;
    }

    public Long getPetId() {
        return petId;
    }

    public String getEspecie() {
        return especie;
    }

    public String getCor() {
        return cor;
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

    public String getChapeu() {
        return chapeu;
    }

    public String getRosto() {
        return rosto;
    }

    public String getAcessorioCorpo() {
        return acessorioCorpo;
    }
}
