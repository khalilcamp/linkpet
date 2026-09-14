package com.lkclone.be.dto;

public class GrupoResponseDTO {

    private Long id;
    private String nome;
    private Long posicao;
    private boolean ativo;

    public GrupoResponseDTO(Long id, String nome, Long posicao, boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.posicao = posicao;
        this.ativo = ativo;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public Long getPosicao() {
        return posicao;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
