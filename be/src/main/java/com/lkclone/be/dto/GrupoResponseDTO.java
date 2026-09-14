package com.lkclone.be.dto;

public class GrupoResponseDTO {

    private Long id;
    private String nome;
    private Long posicao;
    private boolean ativo;
    private String layout;

    public GrupoResponseDTO(Long id, String nome, Long posicao, boolean ativo, String layout) {
        this.id = id;
        this.nome = nome;
        this.posicao = posicao;
        this.ativo = ativo;
        this.layout = layout;
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

    public String getLayout() {
        return layout;
    }
}
