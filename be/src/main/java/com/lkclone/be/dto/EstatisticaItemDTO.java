package com.lkclone.be.dto;

public class EstatisticaItemDTO {

    private String rotulo;
    private long quantidade;

    public EstatisticaItemDTO(String rotulo, long quantidade) {
        this.rotulo = rotulo;
        this.quantidade = quantidade;
    }

    public String getRotulo() {
        return rotulo;
    }

    public long getQuantidade() {
        return quantidade;
    }
}
