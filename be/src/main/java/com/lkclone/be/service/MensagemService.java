package com.lkclone.be.service;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

// Resolve mensagens de erro/validação no idioma do request atual (pt-BR ou
// en), a partir do header Accept-Language enviado pelo frontend.
@Component
public class MensagemService {

    private final MessageSource messageSource;

    public MensagemService(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public String get(String codigo, Object... args) {
        return messageSource.getMessage(codigo, args, LocaleContextHolder.getLocale());
    }
}
