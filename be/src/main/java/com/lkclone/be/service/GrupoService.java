package com.lkclone.be.service;

import com.lkclone.be.exception.RecursoNaoEncontradoException;
import com.lkclone.be.model.Grupo;
import com.lkclone.be.model.Link;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.repository.GrupoRepository;
import com.lkclone.be.repository.LinkRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GrupoService {

    private static final Set<String> LAYOUTS_PERMITIDOS = Set.of("lista", "grid");

    private final GrupoRepository grupoRepository;
    private final LinkRepository linkRepository;
    private final MensagemService mensagemService;
    private final UsuarioService usuarioService;

    public GrupoService(GrupoRepository grupoRepository, LinkRepository linkRepository, MensagemService mensagemService,
                         UsuarioService usuarioService) {
        this.grupoRepository = grupoRepository;
        this.linkRepository = linkRepository;
        this.mensagemService = mensagemService;
        this.usuarioService = usuarioService;
    }

    public Grupo criarGrupo(Usuario dono, String nome) {
        long novaPosicao = grupoRepository.findByUsuario(dono).size() + 1;

        Grupo grupo = new Grupo();
        grupo.setNome(nome);
        grupo.setPosicao(novaPosicao);
        grupo.setAtivo(true);
        grupo.setUsuario(dono);

        return grupoRepository.save(grupo);
    }

    public List<Grupo> listarGrupos(Usuario dono) {
        return grupoRepository.findByUsuario(dono).stream()
                .sorted(Comparator.comparing(Grupo::getPosicao))
                .collect(Collectors.toList());
    }

    public Grupo renomearGrupo(Long grupoId, Usuario dono, String novoNome) {
        Grupo grupo = buscarGrupoDoDono(grupoId, dono);
        grupo.setNome(novoNome);
        return grupoRepository.save(grupo);
    }

    public Grupo alternarAtivo(Long grupoId, Usuario dono, boolean ativo) {
        Grupo grupo = buscarGrupoDoDono(grupoId, dono);
        grupo.setAtivo(ativo);
        return grupoRepository.save(grupo);
    }

    public Grupo atualizarLayout(Long grupoId, Usuario dono, String layout) {
        if (layout == null || !LAYOUTS_PERMITIDOS.contains(layout)) {
            throw new IllegalArgumentException(mensagemService.get("erro.grupo.layoutInvalido", LAYOUTS_PERMITIDOS));
        }
        if (layout.equals("grid") && !usuarioService.ehPremium(dono)) {
            throw new IllegalArgumentException(mensagemService.get("erro.grupo.layoutGridExigePremium"));
        }

        Grupo grupo = buscarGrupoDoDono(grupoId, dono);
        grupo.setLayout(layout);
        return grupoRepository.save(grupo);
    }

    public void excluirGrupo(Long grupoId, Usuario dono) {
        Grupo grupo = buscarGrupoDoDono(grupoId, dono);

        // Apagar o grupo não apaga os links — eles voltam a ficar soltos,
        // no fim da lista de links sem grupo.
        List<Link> linksDoGrupo = linkRepository.getLinkByUsuario(dono).stream()
                .filter(link -> grupo.getId().equals(link.getGrupo() != null ? link.getGrupo().getId() : null))
                .collect(Collectors.toList());

        long proximaPosicaoSolta = proximaPosicaoEntreSoltos(dono);
        for (Link link : linksDoGrupo) {
            link.setGrupo(null);
            link.setLink_position(proximaPosicaoSolta++);
            linkRepository.save(link);
        }

        grupoRepository.delete(grupo);
    }

    public void reordenarGrupos(Usuario dono, List<Long> ordemGrupoIds) {
        List<Grupo> grupos = grupoRepository.findByUsuario(dono);

        Set<Long> idsDoUsuario = grupos.stream().map(Grupo::getId).collect(Collectors.toSet());
        Set<Long> idsInformados = new HashSet<>(ordemGrupoIds == null ? List.of() : ordemGrupoIds);

        if (!idsDoUsuario.equals(idsInformados) || ordemGrupoIds.size() != grupos.size()) {
            throw new IllegalArgumentException(mensagemService.get("erro.grupo.reordenacaoInvalida"));
        }

        Map<Long, Grupo> porId = grupos.stream().collect(Collectors.toMap(Grupo::getId, g -> g));

        long posicao = 1;
        for (Long grupoId : ordemGrupoIds) {
            Grupo grupo = porId.get(grupoId);
            grupo.setPosicao(posicao++);
            grupoRepository.save(grupo);
        }
    }

    public long proximaPosicaoEntreSoltos(Usuario dono) {
        return linkRepository.getLinkByUsuario(dono).stream()
                .filter(link -> link.getGrupo() == null)
                .count() + 1;
    }

    public long proximaPosicaoNoGrupo(Usuario dono, Grupo grupo) {
        return linkRepository.getLinkByUsuario(dono).stream()
                .filter(link -> grupo.equals(link.getGrupo()))
                .count() + 1;
    }

    public Grupo buscarGrupoDoDono(Long grupoId, Usuario dono) {
        Grupo grupo = grupoRepository.findById(grupoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(mensagemService.get("erro.grupo.naoEncontrado")));

        if (!grupo.getUsuario().getId().equals(dono.getId())) {
            throw new AccessDeniedException(mensagemService.get("erro.grupo.acessoNegado"));
        }

        return grupo;
    }
}
