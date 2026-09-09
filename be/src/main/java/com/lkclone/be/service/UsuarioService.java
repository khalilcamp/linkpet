package com.lkclone.be.service;

import com.lkclone.be.exception.RecursoNaoEncontradoException;
import com.lkclone.be.model.PasswordResetToken;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.repository.PasswordResetTokenRepository;
import com.lkclone.be.repository.UsuarioRepository;
import com.lkclone.be.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    private static final Set<String> TEMAS_PERMITIDOS = Set.of("escuro", "claro", "roxo", "verde", "sunset");
    private static final int BIO_TAMANHO_MAXIMO = 280;
    private static final int SENHA_TAMANHO_MINIMO = 6;
    private static final long TOKEN_VALIDADE_HORAS = 1;

    private PasswordEncoder passwordEncoder;
    private UsuarioRepository usuarioRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private JwtUtil jwtUtil;
    private PetService petService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public Usuario cadastrarUsuario(String username, String email, String senhaCrua){
        if (usuarioRepository.existsByUserName(username)) {
            throw new IllegalArgumentException("Esse nome de usuário já está em uso");
        }
        if (usuarioRepository.existsByUserEmail(email)) {
            throw new IllegalArgumentException("Esse e-mail já está cadastrado");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setUserEmail(email);
        novoUsuario.setUserName(username);
        novoUsuario.setUserSenha(passwordEncoder.encode(senhaCrua));

        Usuario salvo = usuarioRepository.save(novoUsuario);
        petService.criarPetParaUsuario(salvo);

        return salvo;
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }

    public UsuarioService(PasswordEncoder passwordEncoder, UsuarioRepository usuarioRepository,
                           PasswordResetTokenRepository passwordResetTokenRepository, JwtUtil jwtUtil, PetService petService) {
        this.passwordEncoder = passwordEncoder;
        this.usuarioRepository = usuarioRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.jwtUtil = jwtUtil;
        this.petService = petService;
    }

    public String autenticar(String userName, String senhaCrua) {
        Usuario usuario = usuarioRepository.getUsuarioByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Usuário ou senha inválidos"));

        if (!passwordEncoder.matches(senhaCrua, usuario.getUserSenha())) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        return jwtUtil.gerarToken(usuario.getUserName());
    }

    public Usuario buscarPorUsername(String userName) {
        return usuarioRepository.getUsuarioByUserName(userName)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }

    public Usuario atualizarTema(Usuario usuario, String tema) {
        if (tema == null || !TEMAS_PERMITIDOS.contains(tema)) {
            throw new IllegalArgumentException("Tema inválido. Escolha um de: " + TEMAS_PERMITIDOS);
        }

        usuario.setTema(tema);
        return usuarioRepository.save(usuario);
    }

    public void registrarVisualizacaoPerfil(Usuario usuario) {
        usuario.setPerfilVisualizacoes(usuario.getPerfilVisualizacoes() + 1);
        usuarioRepository.save(usuario);
    }

    public Usuario atualizarBio(Usuario usuario, String bio) {
        if (bio != null && bio.length() > BIO_TAMANHO_MAXIMO) {
            throw new IllegalArgumentException("A bio deve ter no máximo " + BIO_TAMANHO_MAXIMO + " caracteres");
        }

        usuario.setBio(bio);
        return usuarioRepository.save(usuario);
    }

    public Usuario atualizarFoto(Usuario usuario, String caminhoFoto) {
        usuario.setUserPfp(caminhoFoto);
        return usuarioRepository.save(usuario);
    }

    public void solicitarRedefinicaoSenha(String email) {
        // Sempre silencioso (não revela se o e-mail existe ou não), mesmo
        // quando o usuário não é encontrado, para não permitir enumeração
        // de contas cadastradas.
        usuarioRepository.getUsuarioByUserEmail(email).ifPresent(usuario -> {
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUsuario(usuario);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiraEm(LocalDateTime.now().plusHours(TOKEN_VALIDADE_HORAS));
            resetToken.setUsado(false);
            passwordResetTokenRepository.save(resetToken);

            String link = frontendUrl + "/redefinir-senha?token=" + resetToken.getToken();

            // TODO: plugar um provedor de e-mail real (SMTP/SendGrid/etc) antes
            // de usar isso em produção. Por enquanto, o link só vai pro log.
            logger.info("Link de redefinição de senha para {}: {}", email, link);
        });
    }

    public void redefinirSenha(String token, String novaSenha) {
        if (novaSenha == null || novaSenha.length() < SENHA_TAMANHO_MINIMO) {
            throw new IllegalArgumentException("A senha deve ter no mínimo " + SENHA_TAMANHO_MINIMO + " caracteres");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link inválido ou expirado"));

        if (resetToken.isUsado() || resetToken.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Link inválido ou expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setUserSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        passwordResetTokenRepository.save(resetToken);
    }
}
