package com.lkclone.be.service;

import com.lkclone.be.dto.EstatisticaItemDTO;
import com.lkclone.be.dto.EstatisticasPerfilDTO;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.model.VisualizacaoPerfil;
import com.lkclone.be.repository.VisualizacaoPerfilRepository;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AnalyticsService {

    private static final int TOP_N = 5;
    private static final int DIAS_MAXIMO = 90;

    private final VisualizacaoPerfilRepository visualizacaoPerfilRepository;
    private final GeoIpService geoIpService;
    private final MensagemService mensagemService;

    public AnalyticsService(VisualizacaoPerfilRepository visualizacaoPerfilRepository, GeoIpService geoIpService,
                             MensagemService mensagemService) {
        this.visualizacaoPerfilRepository = visualizacaoPerfilRepository;
        this.geoIpService = geoIpService;
        this.mensagemService = mensagemService;
    }

    public void registrarVisualizacao(Usuario usuario, String referer, String userAgent, String ip) {
        VisualizacaoPerfil visualizacao = new VisualizacaoPerfil();
        visualizacao.setUsuario(usuario);
        visualizacao.setDataHora(LocalDateTime.now());
        visualizacao.setOrigem(extrairOrigem(referer));
        visualizacao.setDispositivo(detectarDispositivo(userAgent));

        VisualizacaoPerfil salva = visualizacaoPerfilRepository.save(visualizacao);
        geoIpService.preencherPais(salva.getId(), ip);
    }

    public EstatisticasPerfilDTO obterEstatisticas(Usuario usuario, int dias) {
        if (dias < 1 || dias > DIAS_MAXIMO) {
            throw new IllegalArgumentException(mensagemService.get("erro.analytics.periodo", DIAS_MAXIMO));
        }

        LocalDateTime desde = LocalDateTime.now().minusDays(dias);
        List<VisualizacaoPerfil> visualizacoes = visualizacaoPerfilRepository
                .findByUsuarioAndDataHoraGreaterThanEqual(usuario, desde);

        List<EstatisticaItemDTO> origens = topN(visualizacoes.stream()
                .map(v -> v.getOrigem() == null ? "direto" : v.getOrigem()));
        List<EstatisticaItemDTO> dispositivos = topN(visualizacoes.stream().map(VisualizacaoPerfil::getDispositivo));
        List<EstatisticaItemDTO> paises = topN(visualizacoes.stream()
                .map(VisualizacaoPerfil::getPais)
                .filter(pais -> pais != null && !pais.isBlank()));

        return new EstatisticasPerfilDTO(visualizacoes.size(), origens, dispositivos, paises);
    }

    private List<EstatisticaItemDTO> topN(Stream<String> valores) {
        return valores.collect(Collectors.groupingBy(v -> v, Collectors.counting())).entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(TOP_N)
                .map(entrada -> new EstatisticaItemDTO(entrada.getKey(), entrada.getValue()))
                .collect(Collectors.toList());
    }

    private String extrairOrigem(String referer) {
        if (referer == null || referer.isBlank()) {
            return null;
        }
        try {
            String host = new URI(referer).getHost();
            return host != null ? host.replaceFirst("^www\\.", "") : null;
        } catch (URISyntaxException e) {
            return null;
        }
    }

    private String detectarDispositivo(String userAgent) {
        if (userAgent == null) {
            return "desktop";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("ipad") || ua.contains("tablet")) {
            return "tablet";
        }
        if (ua.contains("mobi") || ua.contains("android") || ua.contains("iphone")) {
            return "mobile";
        }
        return "desktop";
    }
}
