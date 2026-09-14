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

    // Obrigatória só quando tipoConteudo = "link" (checado no LinkService) —
    // blocos de texto/imagem não precisam de URL pra funcionar.
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

    // Posição entre os destaques (1, 2, 3...) — só tem sentido quando
    // destaque = true. Controla a ordem esquerda→direita na linha
    // horizontal de destaques da página pública.
    private Integer destaquePosicao;

    // "link" (padrão, botão normal), "texto" ou "imagem" — os dois últimos
    // são blocos de conteúdo, exclusivos Premium+ (checado no LinkService).
    @Column(nullable = false)
    private String tipoConteudo = "link";

    // Corpo do bloco de texto, ou legenda opcional do bloco de imagem.
    @Column(columnDefinition = "TEXT")
    private String conteudo;

}
