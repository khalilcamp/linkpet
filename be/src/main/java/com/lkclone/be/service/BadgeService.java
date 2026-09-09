package com.lkclone.be.service;

import com.lkclone.be.model.Usuario;
import com.lkclone.be.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class BadgeService {

    public static final String BADGE_FIRST100 = "first100";
    public static final String BADGE_DEVELOPER = "developer";

    private static final int LIMITE_PRIMEIROS_USUARIOS = 100;

    private final UsuarioRepository usuarioRepository;

    public BadgeService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void avaliarBadgesIniciais(Usuario usuario) {
        // Chamado logo após o cadastro salvar o usuário, então count() já inclui ele.
        if (usuarioRepository.count() <= LIMITE_PRIMEIROS_USUARIOS) {
            conceder(usuario, BADGE_FIRST100);
        }
    }

    public void conceder(Usuario usuario, String badgeCodigo) {
        if (usuario.getUserBadges().contains(badgeCodigo)) {
            return;
        }

        usuario.getUserBadges().add(badgeCodigo);
        usuarioRepository.save(usuario);
    }
}
