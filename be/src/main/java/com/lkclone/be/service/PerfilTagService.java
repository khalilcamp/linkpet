package com.lkclone.be.service;

import com.lkclone.be.model.Usuario;
import com.lkclone.be.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

// Tags de auto-declaração de identidade ("Eu sou..."), escolhidas pelo
// próprio usuário — diferente de BadgeService, que são conquistas concedidas
// manualmente. Por isso o catálogo é fechado (evita texto livre/spam).
@Service
public class PerfilTagService {

    private static final int MAXIMO_TAGS = 6;

    private static final Set<String> TAGS_PERMITIDAS = Set.of(
            "developer", "designer", "artist", "illustrator", "photographer",
            "video_editor", "music_producer", "writer", "game_dev", "streamer",
            "vtuber", "cosplayer", "roleplayer",
            "commissions_open", "commissions_closed", "freelancer_available",
            "job_hunting", "open_to_collab",
            "volunteer", "mentor", "lgbtq_friendly"
    );

    private final UsuarioRepository usuarioRepository;
    private final MensagemService mensagemService;

    public PerfilTagService(UsuarioRepository usuarioRepository, MensagemService mensagemService) {
        this.usuarioRepository = usuarioRepository;
        this.mensagemService = mensagemService;
    }

    public Usuario atualizarTags(Usuario usuario, List<String> tags) {
        Set<String> unicas = new LinkedHashSet<>(tags == null ? List.of() : tags);

        if (unicas.size() > MAXIMO_TAGS) {
            throw new IllegalArgumentException(mensagemService.get("erro.perfilTag.limite", MAXIMO_TAGS));
        }
        if (!TAGS_PERMITIDAS.containsAll(unicas)) {
            throw new IllegalArgumentException(mensagemService.get("erro.perfilTag.invalida"));
        }

        usuario.setPerfilTags(List.copyOf(unicas));
        return usuarioRepository.save(usuario);
    }
}
