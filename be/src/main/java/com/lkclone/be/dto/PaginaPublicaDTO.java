package com.lkclone.be.dto;

import java.util.List;

public class PaginaPublicaDTO {

    private String userName;
    private String userPfp;
    private String bio;
    private String tema;
    private List<LinkResponseDTO> links;
    private PetResponseDTO pet;

    public PaginaPublicaDTO(String userName, String userPfp, String bio, String tema, List<LinkResponseDTO> links, PetResponseDTO pet) {
        this.userName = userName;
        this.userPfp = userPfp;
        this.bio = bio;
        this.tema = tema;
        this.links = links;
        this.pet = pet;
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

    public List<LinkResponseDTO> getLinks() {
        return links;
    }

    public PetResponseDTO getPet() {
        return pet;
    }
}
