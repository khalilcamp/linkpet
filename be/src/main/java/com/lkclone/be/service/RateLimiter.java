package com.lkclone.be.service;

import com.lkclone.be.exception.RateLimitExcedidoException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Limitador em memória por janela fixa. Suficiente para uma única instância
// da aplicação; se um dia isso rodar em múltiplas instâncias, precisa virar
// um contador compartilhado (ex: Redis).
@Component
public class RateLimiter {

    private final Map<String, Janela> janelas = new ConcurrentHashMap<>();

    public void verificar(String chave, int maxRequisicoes, Duration duracaoJanela) {
        Janela janela = janelas.computeIfAbsent(chave, k -> new Janela());

        synchronized (janela) {
            long agora = System.currentTimeMillis();

            if (agora - janela.inicio > duracaoJanela.toMillis()) {
                janela.inicio = agora;
                janela.contagem = 0;
            }

            janela.contagem++;

            if (janela.contagem > maxRequisicoes) {
                throw new RateLimitExcedidoException("Muitas requisições. Tente novamente em instantes.");
            }
        }
    }

    private static class Janela {
        long inicio = System.currentTimeMillis();
        int contagem = 0;
    }
}
