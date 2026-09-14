package com.lkclone.be.controller;

import com.lkclone.be.dto.GrupoPublicoDTO;
import com.lkclone.be.dto.LinkResponseDTO;
import com.lkclone.be.dto.PaginaPublicaDTO;
import com.lkclone.be.dto.PetCurtidaResponseDTO;
import com.lkclone.be.dto.PetResponseDTO;
import com.lkclone.be.model.Grupo;
import com.lkclone.be.model.Link;
import com.lkclone.be.model.Pet;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.service.AnalyticsService;
import com.lkclone.be.service.GrupoService;
import com.lkclone.be.service.LinkService;
import com.lkclone.be.service.PetService;
import com.lkclone.be.service.RateLimiter;
import com.lkclone.be.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class PaginaPublicaController {

    private final UsuarioService usuarioService;
    private final LinkService linkService;
    private final GrupoService grupoService;
    private final PetService petService;
    private final AnalyticsService analyticsService;
    private final RateLimiter rateLimiter;

    public PaginaPublicaController(UsuarioService usuarioService, LinkService linkService, GrupoService grupoService,
                                    PetService petService, AnalyticsService analyticsService, RateLimiter rateLimiter) {
        this.usuarioService = usuarioService;
        this.linkService = linkService;
        this.grupoService = grupoService;
        this.petService = petService;
        this.analyticsService = analyticsService;
        this.rateLimiter = rateLimiter;
    }

    @GetMapping("/p/{username}")
    public PaginaPublicaDTO paginaPublica(@PathVariable String username, HttpServletRequest request) {
        Usuario usuario = usuarioService.buscarPorUsername(username);
        usuarioService.registrarVisualizacaoPerfil(usuario);
        analyticsService.registrarVisualizacao(usuario, request.getHeader("Referer"),
                request.getHeader("User-Agent"), request.getRemoteAddr());

        List<Link> links = linkService.getLinks(usuario);

        List<LinkResponseDTO> linksSemGrupoDTO = links.stream()
                .filter(link -> link.getGrupo() == null)
                .map(this::paraDTO)
                .collect(Collectors.toList());

        List<GrupoPublicoDTO> gruposDTO = grupoService.listarGrupos(usuario).stream()
                .filter(Grupo::isAtivo)
                .map(grupo -> {
                    List<LinkResponseDTO> linksDoGrupo = links.stream()
                            .filter(link -> grupo.equals(link.getGrupo()))
                            .map(this::paraDTO)
                            .collect(Collectors.toList());
                    return new GrupoPublicoDTO(grupo.getNome(), linksDoGrupo);
                })
                // grupo sem nenhum link ativo não tem o que mostrar
                .filter(grupoDTO -> !grupoDTO.getLinks().isEmpty())
                .collect(Collectors.toList());

        Pet pet = petService.buscarPetPorUsuario(usuario);
        PetResponseDTO petDTO = new PetResponseDTO(pet.getId(), pet.getEspecie(), pet.getCor(), pet.getXp(),
                petService.calcularNivel(pet.getXp()), petService.calcularEstagio(pet.getXp()),
                pet.getChapeu(), pet.getRosto(), pet.getAcessorioCorpo());

        return new PaginaPublicaDTO(usuario.getUserName(), usuario.getUserPfp(), usuario.getBio(), usuario.getTema(),
                usuario.getCorPersonalizada(), linksSemGrupoDTO, gruposDTO, petDTO, usuario.getUserBadges(),
                usuario.getPerfilTags(), usuario.isCaptarContato());
    }

    private LinkResponseDTO paraDTO(Link link) {
        return new LinkResponseDTO(link.getLinkId(), link.getUrl(), link.getLabel(), link.getPictureLink(),
                link.getLink_position(), link.isAtivo(), link.getCliques(), link.getDataInicio(), link.getDataFim(),
                link.getGrupo() != null ? link.getGrupo().getId() : null);
    }

    @PostMapping("/p/{username}/pet/like")
    public PetCurtidaResponseDTO curtirPet(@PathVariable String username, @RequestHeader("X-Visitor-Id") String visitorId,
                                            HttpServletRequest request) {
        // O dedup por dia depende do X-Visitor-Id, que o cliente controla —
        // sem isso aqui, bastaria trocar o header pra farmar XP sem limite.
        rateLimiter.verificar("like:" + request.getRemoteAddr(), 5, Duration.ofDays(1));

        Usuario usuario = usuarioService.buscarPorUsername(username);
        PetService.ResultadoCurtida resultado = petService.curtir(usuario, visitorId);
        Pet pet = resultado.getPet();

        return new PetCurtidaResponseDTO(pet.getXp(), petService.calcularNivel(pet.getXp()),
                petService.calcularEstagio(pet.getXp()), resultado.isJaCurtiuHoje());
    }

    @PostMapping("/p/{username}/links/{linkId}/click")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void registrarClique(@PathVariable String username, @PathVariable Long linkId, HttpServletRequest request) {
        rateLimiter.verificar("clique:" + request.getRemoteAddr(), 30, Duration.ofMinutes(1));

        Usuario usuario = usuarioService.buscarPorUsername(username);
        linkService.registrarClique(linkId, usuario);
    }
}
