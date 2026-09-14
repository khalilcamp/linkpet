package com.lkclone.be.controller;

import com.lkclone.be.dto.EstatisticasPerfilDTO;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.service.AnalyticsService;
import com.lkclone.be.service.UsuarioService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios/{usuarioId}/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UsuarioService usuarioService;

    public AnalyticsController(AnalyticsService analyticsService, UsuarioService usuarioService) {
        this.analyticsService = analyticsService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public EstatisticasPerfilDTO obterEstatisticas(@PathVariable Long usuarioId,
                                                     @RequestParam(defaultValue = "30") int dias,
                                                     Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        if (!dono.getUserName().equals(authentication.getName())) {
            throw new AccessDeniedException("Você não pode ver os analytics de outro usuário");
        }

        return analyticsService.obterEstatisticas(dono, dias);
    }
}
