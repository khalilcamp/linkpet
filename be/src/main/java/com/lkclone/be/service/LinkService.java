package com.lkclone.be.service;

import com.lkclone.be.dto.LinkCliqueDiaDTO;
import com.lkclone.be.exception.RecursoNaoEncontradoException;
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
    private static final int HISTORICO_DIAS_MAXIMO = 90;

    private LinkRepository linkRepository;
    private LinkCliqueLogRepository linkCliqueLogRepository;
    private MensagemService mensagemService;


    public Link createLink(String url, String label, String pictureLink, LocalDate dataInicio, LocalDate dataFim, Usuario usuario) {
        validarUrl(url);
        validarPictureLink(pictureLink);
        validarPeriodo(dataInicio, dataFim);

        List<Link> linksExistentes = linkRepository.getLinkByUsuario(usuario);
        long novaPosicao = linksExistentes.size() + 1;

        Link linkCriado = new Link();
        linkCriado.setUrl(url);
        linkCriado.setLabel(label);
        linkCriado.setPictureLink(pictureLink);
        linkCriado.setLink_position(novaPosicao);
        linkCriado.setUsuario(usuario);
        linkCriado.setAtivo(true);
        linkCriado.setDataInicio(dataInicio);
        linkCriado.setDataFim(dataFim);

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

    public Link atualizarLink(Long linkId, Usuario dono, String url, String label, String pictureLink, LocalDate dataInicio, LocalDate dataFim) {
        validarUrl(url);
        validarPictureLink(pictureLink);
        validarPeriodo(dataInicio, dataFim);

        Link link = buscarLinkDoDono(linkId, dono);

        link.setUrl(url);
        link.setLabel(label);
        link.setPictureLink(pictureLink);
        link.setDataInicio(dataInicio);
        link.setDataFim(dataFim);

        return linkRepository.save(link);
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
        List<Link> links = linkRepository.getLinkByUsuario(dono);

        Set<Long> idsDoUsuario = links.stream().map(Link::getLinkId).collect(Collectors.toSet());
        Set<Long> idsInformados = new HashSet<>(ordemLinkIds);

        if (!idsDoUsuario.equals(idsInformados) || ordemLinkIds.size() != links.size()) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.reordenacaoInvalida"));
        }

        Map<Long, Link> porId = links.stream().collect(Collectors.toMap(Link::getLinkId, l -> l));

        long posicao = 1;
        for (Long linkId : ordemLinkIds) {
            Link link = porId.get(linkId);
            link.setLink_position(posicao++);
            linkRepository.save(link);
        }
    }

    private void validarUrl(String url) {
        if (url == null || ESQUEMAS_PERMITIDOS.stream().noneMatch(url::startsWith)) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.urlEsquema"));
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
                        MensagemService mensagemService){
        this.linkRepository = linkRepository;
        this.linkCliqueLogRepository = linkCliqueLogRepository;
        this.mensagemService = mensagemService;
    }
}
