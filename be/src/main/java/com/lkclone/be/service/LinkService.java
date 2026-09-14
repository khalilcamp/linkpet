package com.lkclone.be.service;

import com.lkclone.be.dto.LinkCliqueDiaDTO;
import com.lkclone.be.exception.RecursoNaoEncontradoException;
import com.lkclone.be.model.Grupo;
import com.lkclone.be.model.Link;
import com.lkclone.be.model.LinkCliqueLog;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.repository.LinkCliqueLogRepository;
import com.lkclone.be.repository.LinkRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LinkService {

    private static final List<String> ESQUEMAS_PERMITIDOS = List.of("http://", "https://");
    private static final Set<String> TIPOS_CONTEUDO_PERMITIDOS = Set.of("link", "texto", "imagem");
    private static final int HISTORICO_DIAS_MAXIMO = 90;
    private static final int DESTAQUE_MAXIMO_FREE = 1;
    private static final int DESTAQUE_MAXIMO_PREMIUM = 3;

    private LinkRepository linkRepository;
    private LinkCliqueLogRepository linkCliqueLogRepository;
    private MensagemService mensagemService;
    private GrupoService grupoService;
    private UsuarioService usuarioService;


    public Link createLink(String url, String label, String pictureLink, LocalDate dataInicio, LocalDate dataFim,
                            Long grupoId, boolean exibirComoEmbed, boolean embedCompacto, boolean destaque,
                            String tipoConteudo, String conteudo, Usuario usuario) {
        validarTipoConteudo(tipoConteudo, usuario);
        validarConteudoPorTipo(tipoConteudo, url, pictureLink, conteudo);
        validarPictureLink(pictureLink);
        validarPeriodo(dataInicio, dataFim);

        if (destaque) {
            validarLimiteDestaque(usuario, null);
        }

        Grupo grupo = grupoId != null ? grupoService.buscarGrupoDoDono(grupoId, usuario) : null;
        long novaPosicao = grupo != null
                ? grupoService.proximaPosicaoNoGrupo(usuario, grupo)
                : grupoService.proximaPosicaoEntreSoltos(usuario);

        Link linkCriado = new Link();
        linkCriado.setUrl(url);
        linkCriado.setLabel(label);
        linkCriado.setPictureLink(pictureLink);
        linkCriado.setLink_position(novaPosicao);
        linkCriado.setUsuario(usuario);
        linkCriado.setAtivo(true);
        linkCriado.setDataInicio(dataInicio);
        linkCriado.setDataFim(dataFim);
        linkCriado.setGrupo(grupo);
        linkCriado.setExibirComoEmbed(exibirComoEmbed);
        linkCriado.setEmbedCompacto(embedCompacto);
        linkCriado.setDestaque(destaque);
        linkCriado.setDestaquePosicao(destaque ? proximaPosicaoDestaque(usuario) : null);
        linkCriado.setTipoConteudo(tipoConteudo);
        linkCriado.setConteudo(conteudo);

        return linkRepository.save(linkCriado);
    }

    public List<Link> getLinks(Usuario donoLista) {
        LocalDate hoje = LocalDate.now();
        List<Link> linksUsuario = linkRepository.getLinkByUsuario(donoLista);

        return linksUsuario.stream()
                .filter(Link::isAtivo)
                .filter(link -> link.getDataInicio() == null || !link.getDataInicio().isAfter(hoje))
                .filter(link -> link.getDataFim() == null || !link.getDataFim().isBefore(hoje))
                .sorted(Comparator.comparing(Link::getLink_position))
                .collect(Collectors.toList());
    }

    public List<Link> getTodosLinks(Usuario donoLista) {
        List<Link> linksUsuario = linkRepository.getLinkByUsuario(donoLista);

        return linksUsuario.stream()
                .sorted(Comparator.comparing(Link::getLink_position))
                .collect(Collectors.toList());
    }

    public Link atualizarLink(Long linkId, Usuario dono, String url, String label, String pictureLink, LocalDate dataInicio, LocalDate dataFim,
                               boolean exibirComoEmbed, boolean embedCompacto, boolean destaque, String tipoConteudo, String conteudo) {
        validarTipoConteudo(tipoConteudo, dono);
        validarConteudoPorTipo(tipoConteudo, url, pictureLink, conteudo);
        validarPictureLink(pictureLink);
        validarPeriodo(dataInicio, dataFim);

        Link link = buscarLinkDoDono(linkId, dono);
        boolean eraDestaque = link.isDestaque();

        Integer destaquePosicao = link.getDestaquePosicao();
        if (destaque && !eraDestaque) {
            validarLimiteDestaque(dono, linkId);
            destaquePosicao = proximaPosicaoDestaque(dono);
        } else if (!destaque) {
            destaquePosicao = null;
        }

        link.setUrl(url);
        link.setLabel(label);
        link.setPictureLink(pictureLink);
        link.setDataInicio(dataInicio);
        link.setDataFim(dataFim);
        link.setExibirComoEmbed(exibirComoEmbed);
        link.setEmbedCompacto(embedCompacto);
        link.setDestaque(destaque);
        link.setDestaquePosicao(destaquePosicao);
        link.setTipoConteudo(tipoConteudo);
        link.setConteudo(conteudo);

        Link salvo = linkRepository.save(link);

        if (!destaque && eraDestaque) {
            compactarPosicoesDestaque(dono);
        }

        return salvo;
    }

    public void reordenarDestaque(Usuario dono, List<Long> ordemLinkIds) {
        List<Link> destaques = linkRepository.getLinkByUsuario(dono).stream()
                .filter(Link::isDestaque)
                .collect(Collectors.toList());

        Set<Long> idsDoConjunto = destaques.stream().map(Link::getLinkId).collect(Collectors.toSet());
        Set<Long> idsInformados = new HashSet<>(ordemLinkIds == null ? List.of() : ordemLinkIds);

        if (!idsDoConjunto.equals(idsInformados) || ordemLinkIds.size() != destaques.size()) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.reordenacaoInvalida"));
        }

        Map<Long, Link> porId = destaques.stream().collect(Collectors.toMap(Link::getLinkId, l -> l));

        int posicao = 1;
        for (Long linkId : ordemLinkIds) {
            Link link = porId.get(linkId);
            link.setDestaquePosicao(posicao++);
            linkRepository.save(link);
        }
    }

    private void validarLimiteDestaque(Usuario usuario, Long linkIdExcluir) {
        int limite = usuarioService.ehPremium(usuario) ? DESTAQUE_MAXIMO_PREMIUM : DESTAQUE_MAXIMO_FREE;
        long atuais = linkRepository.getLinkByUsuario(usuario).stream()
                .filter(Link::isDestaque)
                .filter(l -> linkIdExcluir == null || !l.getLinkId().equals(linkIdExcluir))
                .count();
        if (atuais >= limite) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.destaqueLimite", limite));
        }
    }

    private int proximaPosicaoDestaque(Usuario usuario) {
        return (int) linkRepository.getLinkByUsuario(usuario).stream()
                .filter(Link::isDestaque)
                .count() + 1;
    }

    // Fecha o "buraco" deixado na ordem quando um destaque é removido, pra
    // não deixar posições tipo 1, 3 (sem o 2) depois de tirar o do meio.
    private void compactarPosicoesDestaque(Usuario usuario) {
        List<Link> destaques = linkRepository.getLinkByUsuario(usuario).stream()
                .filter(Link::isDestaque)
                .sorted(Comparator.comparing(l -> l.getDestaquePosicao() == null ? Integer.MAX_VALUE : l.getDestaquePosicao()))
                .collect(Collectors.toList());

        int posicao = 1;
        for (Link link : destaques) {
            link.setDestaquePosicao(posicao++);
            linkRepository.save(link);
        }
    }

    public void desativarLink(Long linkId, Usuario dono) {
        Link link = buscarLinkDoDono(linkId, dono);

        link.setAtivo(false);
        linkRepository.save(link);
    }

    public void registrarClique(Long linkId, Usuario dono) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(mensagemService.get("erro.link.naoEncontrado")));

        if (!link.getUsuario().getId().equals(dono.getId())) {
            throw new RecursoNaoEncontradoException("Link não encontrado");
        }

        link.setCliques(link.getCliques() + 1);
        linkRepository.save(link);

        LocalDate hoje = LocalDate.now();
        LinkCliqueLog log = linkCliqueLogRepository.findByLinkAndData(link, hoje)
                .orElseGet(() -> {
                    LinkCliqueLog novo = new LinkCliqueLog();
                    novo.setLink(link);
                    novo.setData(hoje);
                    novo.setQuantidade(0L);
                    return novo;
                });
        log.setQuantidade(log.getQuantidade() + 1);
        linkCliqueLogRepository.save(log);
    }

    public List<LinkCliqueDiaDTO> historicoCliques(Long linkId, Usuario dono, int dias) {
        if (dias < 1 || dias > HISTORICO_DIAS_MAXIMO) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.historicoPeriodo", HISTORICO_DIAS_MAXIMO));
        }

        Link link = buscarLinkDoDono(linkId, dono);
        LocalDate desde = LocalDate.now().minusDays(dias - 1);

        Map<LocalDate, Long> porDia = linkCliqueLogRepository.findByLinkAndDataGreaterThanEqual(link, desde).stream()
                .collect(Collectors.toMap(LinkCliqueLog::getData, LinkCliqueLog::getQuantidade));

        List<LinkCliqueDiaDTO> historico = new ArrayList<>();
        for (int i = dias - 1; i >= 0; i--) {
            LocalDate data = LocalDate.now().minusDays(i);
            historico.add(new LinkCliqueDiaDTO(data, porDia.getOrDefault(data, 0L)));
        }

        return historico;
    }

    public Link reativarLink(Long linkId, Usuario dono) {
        Link link = buscarLinkDoDono(linkId, dono);

        link.setAtivo(true);
        return linkRepository.save(link);
    }

    public void reordenarLinks(Usuario dono, List<Long> ordemLinkIds) {
        List<Link> linksSoltos = linkRepository.getLinkByUsuario(dono).stream()
                .filter(link -> link.getGrupo() == null)
                .collect(Collectors.toList());

        reordenarConjunto(linksSoltos, ordemLinkIds, "erro.link.reordenacaoInvalida");
    }

    public void reordenarLinksDoGrupo(Long grupoId, Usuario dono, List<Long> ordemLinkIds) {
        Grupo grupo = grupoService.buscarGrupoDoDono(grupoId, dono);

        List<Link> linksDoGrupo = linkRepository.getLinkByUsuario(dono).stream()
                .filter(link -> grupo.equals(link.getGrupo()))
                .collect(Collectors.toList());

        reordenarConjunto(linksDoGrupo, ordemLinkIds, "erro.link.reordenacaoInvalida");
    }

    private void reordenarConjunto(List<Link> links, List<Long> ordemLinkIds, String chaveErro) {
        Set<Long> idsDoConjunto = links.stream().map(Link::getLinkId).collect(Collectors.toSet());
        Set<Long> idsInformados = new HashSet<>(ordemLinkIds == null ? List.of() : ordemLinkIds);

        if (!idsDoConjunto.equals(idsInformados) || ordemLinkIds.size() != links.size()) {
            throw new IllegalArgumentException(mensagemService.get(chaveErro));
        }

        Map<Long, Link> porId = links.stream().collect(Collectors.toMap(Link::getLinkId, l -> l));

        long posicao = 1;
        for (Long linkId : ordemLinkIds) {
            Link link = porId.get(linkId);
            link.setLink_position(posicao++);
            linkRepository.save(link);
        }
    }

    public Link moverLinkParaGrupo(Long linkId, Usuario dono, Long grupoId) {
        Link link = buscarLinkDoDono(linkId, dono);
        Grupo grupo = grupoId != null ? grupoService.buscarGrupoDoDono(grupoId, dono) : null;

        long novaPosicao = grupo != null
                ? grupoService.proximaPosicaoNoGrupo(dono, grupo)
                : grupoService.proximaPosicaoEntreSoltos(dono);

        link.setGrupo(grupo);
        link.setLink_position(novaPosicao);

        return linkRepository.save(link);
    }

    private void validarUrl(String url) {
        if (url == null || ESQUEMAS_PERMITIDOS.stream().noneMatch(url::startsWith)) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.urlEsquema"));
        }
    }

    private void validarTipoConteudo(String tipoConteudo, Usuario usuario) {
        if (tipoConteudo == null || !TIPOS_CONTEUDO_PERMITIDOS.contains(tipoConteudo)) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.tipoConteudoInvalido", TIPOS_CONTEUDO_PERMITIDOS));
        }
        if (!tipoConteudo.equals("link") && !usuarioService.ehPremium(usuario)) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.tipoConteudoExigePremium"));
        }
    }

    // Blocos de texto/imagem não exigem URL (diferente do link normal) —
    // mas se uma URL for informada mesmo assim (pra virar clicável), ela
    // ainda precisa ter esquema http/https válido.
    private void validarConteudoPorTipo(String tipoConteudo, String url, String pictureLink, String conteudo) {
        if (tipoConteudo.equals("link")) {
            validarUrl(url);
            return;
        }
        if (url != null && !url.isBlank()) {
            validarUrl(url);
        }
        if (tipoConteudo.equals("texto") && (conteudo == null || conteudo.isBlank())) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.conteudoObrigatorio"));
        }
        if (tipoConteudo.equals("imagem") && (pictureLink == null || pictureLink.isBlank())) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.imagemObrigatoria"));
        }
    }

    private void validarPictureLink(String pictureLink) {
        // Campo opcional (ícone customizado do link) — só valida o esquema
        // quando algo foi informado.
        if (pictureLink == null || pictureLink.isBlank()) {
            return;
        }
        if (ESQUEMAS_PERMITIDOS.stream().noneMatch(pictureLink::startsWith)) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.iconeEsquema"));
        }
    }

    private void validarPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        if (dataInicio != null && dataFim != null && dataFim.isBefore(dataInicio)) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.dataFimAntesInicio"));
        }
    }

    private Link buscarLinkDoDono(Long linkId, Usuario dono) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(mensagemService.get("erro.link.naoEncontrado")));

        if (!link.getUsuario().getId().equals(dono.getId())) {
            throw new AccessDeniedException(mensagemService.get("erro.link.acessoNegado"));
        }

        return link;
    }

    public LinkService(LinkRepository linkRepository, LinkCliqueLogRepository linkCliqueLogRepository,
                        MensagemService mensagemService, GrupoService grupoService, UsuarioService usuarioService){
        this.linkRepository = linkRepository;
        this.linkCliqueLogRepository = linkCliqueLogRepository;
        this.mensagemService = mensagemService;
        this.grupoService = grupoService;
        this.usuarioService = usuarioService;
    }
}
