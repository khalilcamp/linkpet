package com.lkclone.be.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CriarGrupoDTO {

    @NotBlank(message = "{validation.grupo.nome.blank}")
    @Size(max = 100, message = "{validation.grupo.nome.size}")
    private String nome;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
