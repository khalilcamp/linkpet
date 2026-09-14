package com.lkclone.be.controller;

import com.lkclone.be.dto.CapturarContatoDTO;
import com.lkclone.be.dto.ContatoCapturadoResponseDTO;
import com.lkclone.be.model.ContatoCapturado;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.service.ContatoCapturadoService;
import com.lkclone.be.service.RateLimiter;
import com.lkclone.be.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ContatoController {

    private final ContatoCapturadoService contatoCapturadoService;
    private final UsuarioService usuarioService;
    private final RateLimiter rateLimiter;

    public ContatoController(ContatoCapturadoService contatoCapturadoService, UsuarioService usuarioService,
                              RateLimiter rateLimiter) {
        this.contatoCapturadoService = contatoCapturadoService;
        this.usuarioService = usuarioService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/p/{username}/contato")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void capturarContato(@PathVariable String username, @RequestBody CapturarContatoDTO dados, HttpServletRequest request) {
        rateLimiter.verificar("captar-contato:" + request.getRemoteAddr(), 5, Duration.ofMinutes(10));

        Usuario usuario = usuarioService.buscarPorUsername(username);
        contatoCapturadoService.capturar(usuario, dados.getEmail(), dados.getWhatsapp());
    }

    @GetMapping("/usuarios/{usuarioId}/contatos")
    public List<ContatoCapturadoResponseDTO> listarContatos(@PathVariable Long usuarioId, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        return contatoCapturadoService.listar(dono).stream()
                .map(this::paraDTO)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/usuarios/{usuarioId}/contatos/{contatoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirContato(@PathVariable Long usuarioId, @PathVariable Long contatoId, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        verificarDono(dono, authentication);

        contatoCapturadoService.excluir(contatoId, dono);
    }

    private void verificarDono(Usuario dono, Authentication authentication) {
        if (!dono.getUserName().equals(authentication.getName())) {
            throw new AccessDeniedException("Você não pode acessar contatos de outro usuário");
        }
    }

    private ContatoCapturadoResponseDTO paraDTO(ContatoCapturado contato) {
        return new ContatoCapturadoResponseDTO(contato.getId(), contato.getEmail(), contato.getWhatsapp(), contato.getCriadoEm());
    }
}
