package com.lkclone.be.service;

import com.lkclone.be.exception.RecursoNaoEncontradoException;
import com.lkclone.be.model.ContatoCapturado;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.repository.ContatoCapturadoRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ContatoCapturadoService {

    private static final Pattern EMAIL_PADRAO = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern WHATSAPP_DIGITOS = Pattern.compile("\\D");

    private final ContatoCapturadoRepository contatoCapturadoRepository;
    private final MensagemService mensagemService;

    public ContatoCapturadoService(ContatoCapturadoRepository contatoCapturadoRepository, MensagemService mensagemService) {
        this.contatoCapturadoRepository = contatoCapturadoRepository;
        this.mensagemService = mensagemService;
    }

    public ContatoCapturado capturar(Usuario dono, String email, String whatsapp) {
        String emailLimpo = blankParaNull(email);
        String whatsappLimpo = blankParaNull(whatsapp);

        if (emailLimpo == null && whatsappLimpo == null) {
            throw new IllegalArgumentException(mensagemService.get("erro.contato.vazio"));
        }
        if (emailLimpo != null && !EMAIL_PADRAO.matcher(emailLimpo).matches()) {
            throw new IllegalArgumentException(mensagemService.get("erro.contato.emailInvalido"));
        }
        if (whatsappLimpo != null && WHATSAPP_DIGITOS.matcher(whatsappLimpo).replaceAll("").length() < 8) {
            throw new IllegalArgumentException(mensagemService.get("erro.contato.whatsappInvalido"));
        }

        ContatoCapturado contato = new ContatoCapturado();
        contato.setEmail(emailLimpo);
        contato.setWhatsapp(whatsappLimpo);
        contato.setCriadoEm(LocalDateTime.now());
        contato.setUsuario(dono);

        return contatoCapturadoRepository.save(contato);
    }

    public List<ContatoCapturado> listar(Usuario dono) {
        return contatoCapturadoRepository.findByUsuarioOrderByCriadoEmDesc(dono);
    }

    public void excluir(Long contatoId, Usuario dono) {
        ContatoCapturado contato = contatoCapturadoRepository.findById(contatoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(mensagemService.get("erro.contato.naoEncontrado")));

        if (!contato.getUsuario().getId().equals(dono.getId())) {
            throw new AccessDeniedException(mensagemService.get("erro.contato.acessoNegado"));
        }

        contatoCapturadoRepository.delete(contato);
    }

    private String blankParaNull(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }
}
