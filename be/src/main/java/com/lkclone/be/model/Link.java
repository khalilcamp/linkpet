package com.lkclone.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "link_usuario")
public class Link {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long linkId;

    @Column(nullable = false)
    private String url;
    private String pictureLink;

    @Column(nullable = false)
    private Long link_position;

    @Column(nullable = false)
    private String label;
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    private boolean ativo;

    // Grupo opcional — link sem grupo continua aparecendo solto, como sempre
    // funcionou. link_position é a posição relativa ao próprio grupo (ou
    // entre os links soltos, se grupo for null), não um índice global.
    @ManyToOne
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;

    @Column(nullable = false)
    private Long cliques = 0L;

    private LocalDate dataInicio;
    private LocalDate dataFim;

    // Quando true e a URL for de um provedor suportado (YouTube, Spotify),
    // a página pública renderiza o conteúdo embutido em vez de um botão.
    @Column(nullable = false)
    private boolean exibirComoEmbed = false;

    // Versão reduzida do player (barra compacta em vez do card grande).
    @Column(nullable = false)
    private boolean embedCompacto = false;

    // Quando true, o link (embed ou não) aparece numa seção de destaque no
    // topo da página pública, em vez da posição normal dele na lista/grupo.
    @Column(nullable = false)
    private boolean destaque = false;

}
