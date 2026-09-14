package com.lkclone.be.controller;

import com.lkclone.be.dto.AtualizarAparenciaDTO;
import com.lkclone.be.dto.AtualizarBioDTO;
import com.lkclone.be.dto.AtualizarCaptarContatoDTO;
import com.lkclone.be.dto.AtualizarTagsPerfilDTO;
import com.lkclone.be.dto.AtualizarTemaDTO;
import com.lkclone.be.dto.CadastroUsuarioDTO;
import com.lkclone.be.dto.ConfirmarEmailDTO;
import com.lkclone.be.dto.EsqueciSenhaDTO;
import com.lkclone.be.dto.ImagemResponseDTO;
import com.lkclone.be.dto.LoginDTO;
import com.lkclone.be.dto.RedefinirSenhaDTO;
import com.lkclone.be.dto.UsuarioResponseDTO;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.service.ArquivoService;
import com.lkclone.be.service.PerfilTagService;
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
    private final PerfilTagService perfilTagService;

    public UsuarioController(UsuarioService usuarioService, ArquivoService arquivoService, RateLimiter rateLimiter,
                              PerfilTagService perfilTagService) {
        this.usuarioService = usuarioService;
        this.arquivoService = arquivoService;
        this.rateLimiter = rateLimiter;
        this.perfilTagService = perfilTagService;
    }

    @PostMapping
    public UsuarioResponseDTO cadastrar(@Valid @RequestBody CadastroUsuarioDTO dados, HttpServletRequest request) {
        rateLimiter.verificar("cadastro:" + request.getRemoteAddr(), 5, Duration.ofHours(1));

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
    public void redefinirSenha(@Valid @RequestBody RedefinirSenhaDTO dados, HttpServletRequest request) {
        rateLimiter.verificar("redefinir-senha:" + request.getRemoteAddr(), 10, Duration.ofMinutes(1));

        usuarioService.redefinirSenha(dados.getToken(), dados.getNovaSenha());
    }

    @PostMapping("/confirmar-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmarEmail(@RequestBody ConfirmarEmailDTO dados, HttpServletRequest request) {
        rateLimiter.verificar("confirmar-email:" + request.getRemoteAddr(), 10, Duration.ofMinutes(1));

        usuarioService.confirmarEmail(dados.getToken());
    }

    @PostMapping("/reenviar-confirmacao")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reenviarConfirmacao(@RequestBody EsqueciSenhaDTO dados, HttpServletRequest request) {
        rateLimiter.verificar("reenviar-confirmacao:" + request.getRemoteAddr(), 3, Duration.ofMinutes(15));

        usuarioService.reenviarConfirmacaoEmail(dados.getUserEmail());
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

        Usuario atualizado = usuarioService.atualizarTema(usuario, dados.getTema(), dados.getCorPersonalizada());

        return paraDTO(atualizado);
    }

    @PatchMapping("/{usuarioId}/aparencia")
    public UsuarioResponseDTO atualizarAparencia(@PathVariable Long usuarioId, @RequestBody AtualizarAparenciaDTO dados, Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        verificarDono(usuario, authentication);

        Usuario atualizado = usuarioService.atualizarAparencia(usuario, dados.getFonte(), dados.getFormatoBotao(), dados.getEstiloBotao());

        return paraDTO(atualizado);
    }

    @PatchMapping("/{usuarioId}/captar-contato")
    public UsuarioResponseDTO atualizarCaptarContato(@PathVariable Long usuarioId, @RequestBody AtualizarCaptarContatoDTO dados, Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        verificarDono(usuario, authentication);

        Usuario atualizado = usuarioService.atualizarCaptarContato(usuario, dados.isAtivo());

        return paraDTO(atualizado);
    }

    @PatchMapping("/{usuarioId}/bio")
    public UsuarioResponseDTO atualizarBio(@PathVariable Long usuarioId, @RequestBody AtualizarBioDTO dados, Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        verificarDono(usuario, authentication);

        Usuario atualizado = usuarioService.atualizarBio(usuario, dados.getBio());

        return paraDTO(atualizado);
    }

    @PatchMapping("/{usuarioId}/tags-perfil")
    public UsuarioResponseDTO atualizarTagsPerfil(@PathVariable Long usuarioId, @RequestBody AtualizarTagsPerfilDTO dados, Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        verificarDono(usuario, authentication);

        Usuario atualizado = perfilTagService.atualizarTags(usuario, dados.getTags());

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

    // Upload genérico de imagem — usado hoje pelo bloco de conteúdo "imagem"
    // dos links, pra dar a opção de enviar um arquivo do computador em vez
    // de só colar uma URL externa. Não associa a imagem a nada: só sobe pro
    // Storage e devolve a URL pública, quem chama decide onde usar.
    @PostMapping("/{usuarioId}/imagens")
    public ImagemResponseDTO uploadImagem(@PathVariable Long usuarioId, @RequestParam("arquivo") MultipartFile arquivo, Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        verificarDono(usuario, authentication);

        String url = arquivoService.salvarImagem(arquivo);
        return new ImagemResponseDTO(url);
    }

    private void verificarDono(Usuario usuario, Authentication authentication) {
        if (!usuario.getUserName().equals(authentication.getName())) {
            throw new AccessDeniedException("Você não pode alterar dados de outro usuário");
        }
    }

    private UsuarioResponseDTO paraDTO(Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getUserName(), usuario.getUserEmail(),
                usuario.getUserPfp(), usuario.getBio(), usuario.getTema(), usuario.getCorPersonalizada(),
                usuario.getFonte(), usuario.getFormatoBotao(), usuario.getEstiloBotao(),
                usuario.getPerfilVisualizacoes(), usuario.isEmailVerificado(), usuario.isCaptarContato(),
                usuario.getTipoUsuario(), usuario.getUserBadges(), usuario.getPerfilTags());
    }
}
