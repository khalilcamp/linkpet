package com.lkclone.be.controller;

import com.lkclone.be.dto.AtualizarGrupoAtivoDTO;
import com.lkclone.be.dto.CriarGrupoDTO;
import com.lkclone.be.dto.GrupoResponseDTO;
import com.lkclone.be.dto.LinkResponseDTO;
import com.lkclone.be.dto.ReordenarGruposDTO;
import com.lkclone.be.dto.ReordenarLinksDTO;
import com.lkclone.be.model.Grupo;
import com.lkclone.be.model.Link;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.service.GrupoService;
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
@RequestMapping("/usuarios/{usuarioId}/grupos")
public class GrupoController {

    private final GrupoService grupoService;
    private final LinkService linkService;
    private final UsuarioService usuarioService;

    public GrupoController(GrupoService grupoService, LinkService linkService, UsuarioService usuarioService) {
        this.grupoService = grupoService;
        this.linkService = linkService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<GrupoResponseDTO> listarGrupos(@PathVariable Long usuarioId, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        return grupoService.listarGrupos(dono).stream()
                .map(this::paraDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public GrupoResponseDTO criarGrupo(@PathVariable Long usuarioId, @Valid @RequestBody CriarGrupoDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        Grupo grupo = grupoService.criarGrupo(dono, dados.getNome());
        return paraDTO(grupo);
    }

    @PatchMapping("/{grupoId}")
    public GrupoResponseDTO renomearGrupo(@PathVariable Long usuarioId, @PathVariable Long grupoId,
                                           @Valid @RequestBody CriarGrupoDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        Grupo grupo = grupoService.renomearGrupo(grupoId, dono, dados.getNome());
        return paraDTO(grupo);
    }

    @PatchMapping("/{grupoId}/ativo")
    public GrupoResponseDTO alternarAtivo(@PathVariable Long usuarioId, @PathVariable Long grupoId,
                                           @RequestBody AtualizarGrupoAtivoDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        Grupo grupo = grupoService.alternarAtivo(grupoId, dono, dados.isAtivo());
        return paraDTO(grupo);
    }

    @DeleteMapping("/{grupoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirGrupo(@PathVariable Long usuarioId, @PathVariable Long grupoId, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        grupoService.excluirGrupo(grupoId, dono);
    }

    @PatchMapping("/reordenar")
    public List<GrupoResponseDTO> reordenarGrupos(@PathVariable Long usuarioId, @RequestBody ReordenarGruposDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        grupoService.reordenarGrupos(dono, dados.getOrdem());
        return grupoService.listarGrupos(dono).stream()
                .map(this::paraDTO)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{grupoId}/links/reordenar")
    public List<LinkResponseDTO> reordenarLinksDoGrupo(@PathVariable Long usuarioId, @PathVariable Long grupoId,
                                                         @RequestBody ReordenarLinksDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        linkService.reordenarLinksDoGrupo(grupoId, dono, dados.getOrdem());
        return linkService.getTodosLinks(dono).stream()
                .map(this::paraLinkDTO)
                .collect(Collectors.toList());
    }

    private void verificarDono(Usuario dono, Authentication authentication) {
        if (!dono.getUserName().equals(authentication.getName())) {
            throw new AccessDeniedException("Você não pode acessar grupos de outro usuário");
        }
    }

    private GrupoResponseDTO paraDTO(Grupo grupo) {
        return new GrupoResponseDTO(grupo.getId(), grupo.getNome(), grupo.getPosicao(), grupo.isAtivo());
    }

    private LinkResponseDTO paraLinkDTO(Link link) {
        return new LinkResponseDTO(link.getLinkId(), link.getUrl(), link.getLabel(), link.getPictureLink(),
                link.getLink_position(), link.isAtivo(), link.getCliques(), link.getDataInicio(), link.getDataFim(),
                link.getGrupo() != null ? link.getGrupo().getId() : null, link.isExibirComoEmbed(),
                link.isEmbedCompacto(), link.isDestaque());
    }
}
