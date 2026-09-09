package com.lkclone.be.exception;

public class RateLimitExcedidoException extends RuntimeException {

    public RateLimitExcedidoException(String mensagem) {
        super(mensagem);
    }
}
