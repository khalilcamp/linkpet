package com.lkclone.be.dto;

import java.util.List;

// Versão pública de um grupo: só o que a página de visitante precisa —
// sem id/posição/ativo, que são detalhes de gestão do dono.
public class GrupoPublicoDTO {

    private String nome;
    private List<LinkResponseDTO> links;
    private String layout;

    public GrupoPublicoDTO(String nome, List<LinkResponseDTO> links, String layout) {
        this.nome = nome;
        this.links = links;
        this.layout = layout;
    }

    public String getNome() {
        return nome;
    }

    public List<LinkResponseDTO> getLinks() {
        return links;
    }

    public String getLayout() {
        return layout;
    }
}
