package com.lkclone.be.service;

import com.lkclone.be.repository.VisualizacaoPerfilRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Descobre o país de um IP via API gratuita, em background — não pode
// atrasar a resposta de GET /p/{username}, e falhar aqui nunca deve quebrar
// nada (o país fica só null se não der).
@Service
public class GeoIpService {

    private static final Logger logger = LoggerFactory.getLogger(GeoIpService.class);
    private static final Pattern COUNTRY_CODE_PADRAO = Pattern.compile("\"countryCode\":\"([A-Z]{2})\"");

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final VisualizacaoPerfilRepository visualizacaoPerfilRepository;

    public GeoIpService(VisualizacaoPerfilRepository visualizacaoPerfilRepository) {
        this.visualizacaoPerfilRepository = visualizacaoPerfilRepository;
    }

    @Async
    public void preencherPais(Long visualizacaoId, String ip) {
        if (ip == null || ip.isBlank()) {
            return;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://ip-api.com/json/" + ip + "?fields=countryCode,status"))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return;
            }

            Matcher matcher = COUNTRY_CODE_PADRAO.matcher(response.body());
            if (!matcher.find()) {
                return;
            }

            visualizacaoPerfilRepository.findById(visualizacaoId).ifPresent(visualizacao -> {
                visualizacao.setPais(matcher.group(1));
                visualizacaoPerfilRepository.save(visualizacao);
            });
        } catch (IOException e) {
            logger.warn("Falha ao buscar país pra IP (best-effort, ignorado): {}", e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
