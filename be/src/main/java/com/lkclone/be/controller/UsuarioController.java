package com.lkclone.be.controller;

import com.lkclone.be.dto.AtualizarBioDTO;
import com.lkclone.be.dto.AtualizarTemaDTO;
import com.lkclone.be.dto.CadastroUsuarioDTO;
import com.lkclone.be.dto.EsqueciSenhaDTO;
import com.lkclone.be.dto.LoginDTO;
import com.lkclone.be.dto.RedefinirSenhaDTO;
import com.lkclone.be.dto.UsuarioResponseDTO;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.service.ArquivoService;
import com.lkclone.be.service.RateLimiter;
import com.lkclone.be.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final ArquivoService arquivoService;
    private final RateLimiter rateLimiter;

    public UsuarioController(UsuarioService usuarioService, ArquivoService arquivoService, RateLimiter rateLimiter) {
        this.usuarioService = usuarioService;
        this.arquivoService = arquivoService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping
    public UsuarioResponseDTO cadastrar(@Valid @RequestBody CadastroUsuarioDTO dados) {
        Usuario usuario = usuarioService.cadastrarUsuario(
                dados.getUserName(),
                dados.getUserEmail(),
                dados.getSenha()
        );

        return paraDTO(usuario);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginDTO dados, HttpServletRequest request) {
        rateLimiter.verificar("login:" + request.getRemoteAddr(), 5, Duration.ofMinutes(1));

        return usuarioService.autenticar(dados.getUserName(), dados.getSenha());
    }

    @PostMapping("/esqueci-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void esqueciSenha(@RequestBody EsqueciSenhaDTO dados, HttpServletRequest request) {
        rateLimiter.verificar("esqueci-senha:" + request.getRemoteAddr(), 3, Duration.ofMinutes(15));

        usuarioService.solicitarRedefinicaoSenha(dados.getUserEmail());
    }

    @PostMapping("/redefinir-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void redefinirSenha(@RequestBody RedefinirSenhaDTO dados) {
        usuarioService.redefinirSenha(dados.getToken(), dados.getNovaSenha());
    }

    @GetMapping("/me")
    public UsuarioResponseDTO meuPerfil(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioService.buscarPorUsername(username);

        return paraDTO(usuario);
    }

    @PatchMapping("/{usuarioId}/tema")
    public UsuarioResponseDTO atualizarTema(@PathVariable Long usuarioId, @RequestBody AtualizarTemaDTO dados, Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        verificarDono(usuario, authentication);

        Usuario atualizado = usuarioService.atualizarTema(usuario, dados.getTema());

        return paraDTO(atualizado);
    }

    @PatchMapping("/{usuarioId}/bio")
    public UsuarioResponseDTO atualizarBio(@PathVariable Long usuarioId, @RequestBody AtualizarBioDTO dados, Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        verificarDono(usuario, authentication);

        Usuario atualizado = usuarioService.atualizarBio(usuario, dados.getBio());

        return paraDTO(atualizado);
    }

    @PostMapping("/{usuarioId}/pfp")
    public UsuarioResponseDTO atualizarFoto(@PathVariable Long usuarioId, @RequestParam("arquivo") MultipartFile arquivo, Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        verificarDono(usuario, authentication);

        String fotoAntiga = usuario.getUserPfp();
        String caminho = arquivoService.salvarImagem(arquivo);
        Usuario atualizado = usuarioService.atualizarFoto(usuario, caminho);
        arquivoService.removerImagem(fotoAntiga);

        return paraDTO(atualizado);
    }

    private void verificarDono(Usuario usuario, Authentication authentication) {
        if (!usuario.getUserName().equals(authentication.getName())) {
            throw new AccessDeniedException("Você não pode alterar dados de outro usuário");
        }
    }

    private UsuarioResponseDTO paraDTO(Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getUserName(), usuario.getUserEmail(),
                usuario.getUserPfp(), usuario.getBio(), usuario.getTema(), usuario.getPerfilVisualizacoes());
    }
}
