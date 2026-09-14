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

    private static final Set<String> TEMAS_PERMITIDOS = Set.of("escuro", "claro", "roxo", "verde", "sunset", "custom");
    private static final Set<String> FONTES_PERMITIDAS = Set.of("padrao", "serif", "mono", "arredondada");
    private static final Set<String> FORMATOS_BOTAO_PERMITIDOS = Set.of("quadrado", "arredondado", "pill");
    private static final Set<String> ESTILOS_BOTAO_PERMITIDOS = Set.of("preenchido", "contorno", "sombra");
    private static final Set<String> TIPOS_USUARIO_PREMIUM = Set.of("Premium", "Empresa", "Colaborador", "Desenvolvedor");
    private static final int BIO_TAMANHO_MAXIMO = 280;
    private static final int SENHA_TAMANHO_MINIMO = 8;
    // Exige ao menos uma letra e um número, sem restringir caracteres especiais.
    private static final Pattern SENHA_PADRAO = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d).+$");
    private static final Pattern COR_PADRAO = Pattern.compile("^#[0-9A-Fa-f]{6}$");
    private static final long TOKEN_VALIDADE_HORAS = 1;

    // Hash BCrypt de uma senha que não existe de verdade — usado só pra
    // gastar o mesmo tempo de comparação quando o usuário não é encontrado,
    // e não dar pra descobrir usernames válidos medindo o tempo de resposta
    // do login (usuário inexistente rejeitava na hora; existente esperava
    // o BCrypt rodar).
    private static final String HASH_FANTASMA = "$2a$10$xOBnS0/H7TUZPjJKQFFpVOkrWOtTM1VTSh7BVV3P2E61yD2LdyA5e";

    private PasswordEncoder passwordEncoder;
    private UsuarioRepository usuarioRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    private JwtUtil jwtUtil;
    private PetService petService;
    private EmailService emailService;
    private BadgeService badgeService;
    private MensagemService mensagemService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public Usuario cadastrarUsuario(String username, String email, String senhaCrua){
        if (usuarioRepository.existsByUserName(username)) {
            throw new IllegalArgumentException(mensagemService.get("erro.usuario.nomeEmUso"));
        }
        if (usuarioRepository.existsByUserEmail(email)) {
            throw new IllegalArgumentException(mensagemService.get("erro.usuario.emailCadastrado"));
        }
        validarSenha(senhaCrua);

        Usuario novoUsuario = new Usuario();
        novoUsuario.setUserEmail(email);
        novoUsuario.setUserName(username);
        novoUsuario.setUserSenha(passwordEncoder.encode(senhaCrua));

        Usuario salvo = usuarioRepository.save(novoUsuario);
        petService.criarPetParaUsuario(salvo);
        enviarEmailConfirmacao(salvo);
        badgeService.avaliarBadgesIniciais(salvo);

        return salvo;
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(mensagemService.get("erro.usuario.naoEncontrado")));
    }

    // Único lugar que sabe quais tipoUsuario contam como "pago" — qualquer
    // feature gateada por plano (layout em grid, blocos de conteúdo, etc)
    // deve checar por aqui em vez de repetir o set em cada serviço.
    public boolean ehPremium(Usuario usuario) {
        return TIPOS_USUARIO_PREMIUM.contains(usuario.getTipoUsuario());
    }

    public UsuarioService(PasswordEncoder passwordEncoder, UsuarioRepository usuarioRepository,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           EmailVerificationTokenRepository emailVerificationTokenRepository,
                           JwtUtil jwtUtil, PetService petService, EmailService emailService, BadgeService badgeService,
                           MensagemService mensagemService) {
        this.passwordEncoder = passwordEncoder;
        this.usuarioRepository = usuarioRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.jwtUtil = jwtUtil;
        this.petService = petService;
        this.emailService = emailService;
        this.badgeService = badgeService;
        this.mensagemService = mensagemService;
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.length() < SENHA_TAMANHO_MINIMO) {
            throw new IllegalArgumentException(mensagemService.get("erro.senha.minima", SENHA_TAMANHO_MINIMO));
        }
        if (!SENHA_PADRAO.matcher(senha).matches()) {
            throw new IllegalArgumentException(mensagemService.get("erro.senha.letrasNumeros"));
        }
    }

    public String autenticar(String userName, String senhaCrua) {
        Usuario usuario = usuarioRepository.getUsuarioByUserName(userName).orElse(null);

        // Roda o BCrypt sempre, mesmo se o usuário não existir (contra um
        // hash fantasma), pra não vazar por timing se o username é válido.
        String hashParaComparar = usuario != null ? usuario.getUserSenha() : HASH_FANTASMA;
        boolean senhaConfere = passwordEncoder.matches(senhaCrua, hashParaComparar);

        if (usuario == null || !senhaConfere) {
            throw new CredenciaisInvalidasException(mensagemService.get("erro.credenciais.invalidas"));
        }

        return jwtUtil.gerarToken(usuario.getUserName());
    }

    public Usuario buscarPorUsername(String userName) {
        return usuarioRepository.getUsuarioByUserName(userName)
                .orElseThrow(() -> new RecursoNaoEncontradoException(mensagemService.get("erro.usuario.naoEncontrado")));
    }

    public Usuario atualizarTema(Usuario usuario, String tema, String corPersonalizada) {
        if (tema == null || !TEMAS_PERMITIDOS.contains(tema)) {
            throw new IllegalArgumentException(mensagemService.get("erro.tema.invalido", TEMAS_PERMITIDOS));
        }
        if ("custom".equals(tema)) {
            if (corPersonalizada == null || !COR_PADRAO.matcher(corPersonalizada).matches()) {
                throw new IllegalArgumentException(mensagemService.get("erro.tema.corInvalida"));
            }
            usuario.setCorPersonalizada(corPersonalizada);
        }

        usuario.setTema(tema);
        return usuarioRepository.save(usuario);
    }

    public Usuario atualizarAparencia(Usuario usuario, String fonte, String formatoBotao, String estiloBotao) {
        if (fonte == null || !FONTES_PERMITIDAS.contains(fonte)) {
            throw new IllegalArgumentException(mensagemService.get("erro.aparencia.fonteInvalida", FONTES_PERMITIDAS));
        }
        if (formatoBotao == null || !FORMATOS_BOTAO_PERMITIDOS.contains(formatoBotao)) {
            throw new IllegalArgumentException(mensagemService.get("erro.aparencia.formatoBotaoInvalido", FORMATOS_BOTAO_PERMITIDOS));
        }
        if (estiloBotao == null || !ESTILOS_BOTAO_PERMITIDOS.contains(estiloBotao)) {
            throw new IllegalArgumentException(mensagemService.get("erro.aparencia.estiloBotaoInvalido", ESTILOS_BOTAO_PERMITIDOS));
        }

        usuario.setFonte(fonte);
        usuario.setFormatoBotao(formatoBotao);
        usuario.setEstiloBotao(estiloBotao);
        return usuarioRepository.save(usuario);
    }

    public Usuario atualizarCaptarContato(Usuario usuario, boolean ativo) {
        usuario.setCaptarContato(ativo);
        return usuarioRepository.save(usuario);
    }

    public void registrarVisualizacaoPerfil(Usuario usuario) {
        usuario.setPerfilVisualizacoes(usuario.getPerfilVisualizacoes() + 1);
        usuarioRepository.save(usuario);
    }

    public Usuario atualizarBio(Usuario usuario, String bio) {
        if (bio != null && bio.length() > BIO_TAMANHO_MAXIMO) {
            throw new IllegalArgumentException(mensagemService.get("erro.bio.tamanho", BIO_TAMANHO_MAXIMO));
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
                .orElseThrow(() -> new IllegalArgumentException(mensagemService.get("erro.link.invalidoExpirado")));

        if (resetToken.isUsado() || resetToken.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.invalidoExpirado"));
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
                .orElseThrow(() -> new IllegalArgumentException(mensagemService.get("erro.link.invalidoExpirado")));

        if (verificationToken.isUsado() || verificationToken.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(mensagemService.get("erro.link.invalidoExpirado"));
        }

        Usuario usuario = verificationToken.getUsuario();
        usuario.setEmailVerificado(true);
        usuarioRepository.save(usuario);

        verificationToken.setUsado(true);
        emailVerificationTokenRepository.save(verificationToken);
    }
}
