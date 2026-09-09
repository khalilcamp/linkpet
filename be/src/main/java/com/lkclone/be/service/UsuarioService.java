package com.lkclone.be.service;

import com.lkclone.be.exception.CredenciaisInvalidasException;
import com.lkclone.be.exception.RecursoNaoEncontradoException;
import com.lkclone.be.model.EmailVerificationToken;
import com.lkclone.be.model.PasswordResetToken;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.repository.EmailVerificationTokenRepository;
import com.lkclone.be.repository.PasswordResetTokenRepository;
import com.lkclone.be.repository.UsuarioRepository;
import com.lkclone.be.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UsuarioService {

    private static final Set<String> TEMAS_PERMITIDOS = Set.of("escuro", "claro", "roxo", "verde", "sunset");
    private static final int BIO_TAMANHO_MAXIMO = 280;
    private static final int SENHA_TAMANHO_MINIMO = 8;
    // Exige ao menos uma letra e um número, sem restringir caracteres especiais.
    private static final Pattern SENHA_PADRAO = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d).+$");
    private static final long TOKEN_VALIDADE_HORAS = 1;

    private PasswordEncoder passwordEncoder;
    private UsuarioRepository usuarioRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    private JwtUtil jwtUtil;
    private PetService petService;
    private EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public Usuario cadastrarUsuario(String username, String email, String senhaCrua){
        if (usuarioRepository.existsByUserName(username)) {
            throw new IllegalArgumentException("Esse nome de usuário já está em uso");
        }
        if (usuarioRepository.existsByUserEmail(email)) {
            throw new IllegalArgumentException("Esse e-mail já está cadastrado");
        }
        validarSenha(senhaCrua);

        Usuario novoUsuario = new Usuario();
        novoUsuario.setUserEmail(email);
        novoUsuario.setUserName(username);
        novoUsuario.setUserSenha(passwordEncoder.encode(senhaCrua));

        Usuario salvo = usuarioRepository.save(novoUsuario);
        petService.criarPetParaUsuario(salvo);
        enviarEmailConfirmacao(salvo);

        return salvo;
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }

    public UsuarioService(PasswordEncoder passwordEncoder, UsuarioRepository usuarioRepository,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           EmailVerificationTokenRepository emailVerificationTokenRepository,
                           JwtUtil jwtUtil, PetService petService, EmailService emailService) {
        this.passwordEncoder = passwordEncoder;
        this.usuarioRepository = usuarioRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.jwtUtil = jwtUtil;
        this.petService = petService;
        this.emailService = emailService;
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.length() < SENHA_TAMANHO_MINIMO) {
            throw new IllegalArgumentException("A senha deve ter no mínimo " + SENHA_TAMANHO_MINIMO + " caracteres");
        }
        if (!SENHA_PADRAO.matcher(senha).matches()) {
            throw new IllegalArgumentException("A senha deve conter letras e números");
        }
    }

    public String autenticar(String userName, String senhaCrua) {
        Usuario usuario = usuarioRepository.getUsuarioByUserName(userName)
                .orElseThrow(() -> new CredenciaisInvalidasException("Usuário ou senha inválidos"));

        if (!passwordEncoder.matches(senhaCrua, usuario.getUserSenha())) {
            throw new CredenciaisInvalidasException("Usuário ou senha inválidos");
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
            emailService.enviarEmailRedefinicaoSenha(email, link);
        });
    }

    public void redefinirSenha(String token, String novaSenha) {
        validarSenha(novaSenha);

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

    private void enviarEmailConfirmacao(Usuario usuario) {
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUsuario(usuario);
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setExpiraEm(LocalDateTime.now().plusHours(24));
        verificationToken.setUsado(false);
        emailVerificationTokenRepository.save(verificationToken);

        String link = frontendUrl + "/confirmar-email?token=" + verificationToken.getToken();
        emailService.enviarEmailConfirmacao(usuario.getUserEmail(), link);
    }

    public void reenviarConfirmacaoEmail(String email) {
        // Mesmo padrão silencioso do esqueci-senha: não revela se o e-mail existe.
        usuarioRepository.getUsuarioByUserEmail(email)
                .filter(usuario -> !usuario.isEmailVerificado())
                .ifPresent(this::enviarEmailConfirmacao);
    }

    public void confirmarEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link inválido ou expirado"));

        if (verificationToken.isUsado() || verificationToken.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Link inválido ou expirado");
        }

        Usuario usuario = verificationToken.getUsuario();
        usuario.setEmailVerificado(true);
        usuarioRepository.save(usuario);

        verificationToken.setUsado(true);
        emailVerificationTokenRepository.save(verificationToken);
    }
}
