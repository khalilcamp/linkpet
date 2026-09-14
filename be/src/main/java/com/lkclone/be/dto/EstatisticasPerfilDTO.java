package com.lkclone.be.dto;

import java.util.List;

public class EstatisticasPerfilDTO {

    private long total;
    private List<EstatisticaItemDTO> origens;
    private List<EstatisticaItemDTO> dispositivos;
    private List<EstatisticaItemDTO> paises;

    public EstatisticasPerfilDTO(long total, List<EstatisticaItemDTO> origens, List<EstatisticaItemDTO> dispositivos,
                                  List<EstatisticaItemDTO> paises) {
        this.total = total;
        this.origens = origens;
        this.dispositivos = dispositivos;
        this.paises = paises;
    }

    public long getTotal() {
        return total;
    }

    public List<EstatisticaItemDTO> getOrigens() {
        return origens;
    }

    public List<EstatisticaItemDTO> getDispositivos() {
        return dispositivos;
    }

    public List<EstatisticaItemDTO> getPaises() {
        return paises;
    }
}
