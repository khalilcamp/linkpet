package com.lkclone.be.controller;

import com.lkclone.be.dto.AtualizarLinkDTO;
import com.lkclone.be.dto.CriarLinkDTO;
import com.lkclone.be.dto.LinkCliqueDiaDTO;
import com.lkclone.be.dto.LinkResponseDTO;
import com.lkclone.be.dto.MoverLinkDTO;
import com.lkclone.be.dto.ReordenarLinksDTO;
import com.lkclone.be.model.Link;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.service.LinkService;
import com.lkclone.be.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuarios/{usuarioId}/links")
public class LinkController {

    private final LinkService linkService;
    private final UsuarioService usuarioService;

    public LinkController(LinkService linkService, UsuarioService usuarioService) {
        this.linkService = linkService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public LinkResponseDTO criarLink(@PathVariable Long usuarioId, @Valid @RequestBody CriarLinkDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        Link link = linkService.createLink(dados.getUrl(), dados.getLabel(), dados.getPictureLink(),
                dados.getDataInicio(), dados.getDataFim(), dados.getGrupoId(), dados.isExibirComoEmbed(),
                dados.isEmbedCompacto(), dados.isDestaque(), dados.getTipoConteudo(), dados.getConteudo(), dono);

        return paraDTO(link);
    }

    @GetMapping
    public List<LinkResponseDTO> listarLinks(@PathVariable Long usuarioId, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        List<Link> links = linkService.getTodosLinks(dono);

        return links.stream()
                .map(this::paraDTO)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{linkId}")
    public LinkResponseDTO atualizarLink(@PathVariable Long usuarioId, @PathVariable Long linkId,
                                          @Valid @RequestBody AtualizarLinkDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        Link link = linkService.atualizarLink(linkId, dono, dados.getUrl(), dados.getLabel(), dados.getPictureLink(),
                dados.getDataInicio(), dados.getDataFim(), dados.isExibirComoEmbed(), dados.isEmbedCompacto(), dados.isDestaque(),
                dados.getTipoConteudo(), dados.getConteudo());

        return paraDTO(link);
    }

    @DeleteMapping("/{linkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerLink(@PathVariable Long usuarioId, @PathVariable Long linkId, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        linkService.desativarLink(linkId, dono);
    }

    @PatchMapping("/{linkId}/reativar")
    public LinkResponseDTO reativarLink(@PathVariable Long usuarioId, @PathVariable Long linkId, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        Link link = linkService.reativarLink(linkId, dono);

        return paraDTO(link);
    }

    @PatchMapping("/{linkId}/mover")
    public LinkResponseDTO moverLink(@PathVariable Long usuarioId, @PathVariable Long linkId,
                                      @RequestBody MoverLinkDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        Link link = linkService.moverLinkParaGrupo(linkId, dono, dados.getGrupoId());
        return paraDTO(link);
    }

    @PatchMapping("/reordenar")
    public List<LinkResponseDTO> reordenarLinks(@PathVariable Long usuarioId, @RequestBody ReordenarLinksDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        linkService.reordenarLinks(dono, dados.getOrdem());

        return linkService.getTodosLinks(dono).stream()
                .map(this::paraDTO)
                .collect(Collectors.toList());
    }

    @PatchMapping("/destaque/reordenar")
    public List<LinkResponseDTO> reordenarDestaque(@PathVariable Long usuarioId, @RequestBody ReordenarLinksDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        linkService.reordenarDestaque(dono, dados.getOrdem());

        return linkService.getTodosLinks(dono).stream()
                .map(this::paraDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{linkId}/cliques/historico")
    public List<LinkCliqueDiaDTO> historicoCliques(@PathVariable Long usuarioId, @PathVariable Long linkId,
                                                     @RequestParam(defaultValue = "7") int dias, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        return linkService.historicoCliques(linkId, dono, dias);
    }

    private void verificarDono(Usuario dono, Authentication authentication) {
        if (!dono.getUserName().equals(authentication.getName())) {
            throw new AccessDeniedException("Você não pode acessar links de outro usuário");
        }
    }

    private LinkResponseDTO paraDTO(Link link) {
        return new LinkResponseDTO(link.getLinkId(), link.getUrl(), link.getLabel(), link.getPictureLink(),
                link.getLink_position(), link.isAtivo(), link.getCliques(), link.getDataInicio(), link.getDataFim(),
                link.getGrupo() != null ? link.getGrupo().getId() : null, link.isExibirComoEmbed(),
                link.isEmbedCompacto(), link.isDestaque(), link.getDestaquePosicao(), link.getTipoConteudo(), link.getConteudo());
    }
}
