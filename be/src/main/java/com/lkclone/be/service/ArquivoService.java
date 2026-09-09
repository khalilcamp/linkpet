package com.lkclone.be.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Set;
import java.util.UUID;

@Service
public class ArquivoService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of("image/png", "image/jpeg", "image/webp");
    private static final long TAMANHO_MAXIMO = 3 * 1024 * 1024;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String supabaseServiceKey;

    // O endpoint do Storage tenta decodificar o header Authorization como
    // JWT, e a chave nova (sb_secret_...) não é um JWT — por isso precisa
    // do service_role JWT legado especificamente aqui, mesmo usando a
    // chave nova no apikey.
    @Value("${supabase.service-role-jwt}")
    private String supabaseServiceRoleJwt;

    @Value("${supabase.storage-bucket:avatars}")
    private String bucket;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String salvarImagem(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Nenhum arquivo enviado");
        }
        String contentType = arquivo.getContentType();
        if (!TIPOS_PERMITIDOS.contains(contentType)) {
            throw new IllegalArgumentException("Formato de imagem não suportado. Use PNG, JPEG ou WEBP");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO) {
            throw new IllegalArgumentException("Imagem muito grande (máximo 3MB)");
        }

        byte[] bytes;
        try {
            bytes = arquivo.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Erro ao ler o arquivo enviado", e);
        }

        // O Content-Type do multipart é só o que o cliente declarou — sem
        // checar a assinatura real dos bytes, dava pra subir qualquer
        // arquivo se mentindo como imagem.
        if (!assinaturaCondizComTipo(bytes, contentType)) {
            throw new IllegalArgumentException("O arquivo enviado não é uma imagem válida");
        }

        String extensao = switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
        String nomeArquivo = UUID.randomUUID() + extensao;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseUrl + "/storage/v1/object/" + bucket + "/" + nomeArquivo))
                .header("apikey", supabaseServiceKey)
                .header("Authorization", "Bearer " + supabaseServiceRoleJwt)
                .header("Content-Type", contentType)
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();

        HttpResponse<String> response = enviar(request);
        if (response.statusCode() >= 300) {
            throw new RuntimeException("Erro ao salvar imagem no Supabase Storage: " + response.body());
        }

        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + nomeArquivo;
    }

    public void removerImagem(String url) {
        String prefixo = supabaseUrl + "/storage/v1/object/public/" + bucket + "/";
        if (url == null || !url.startsWith(prefixo)) {
            return;
        }

        String nomeArquivo = url.substring(prefixo.length());
        if (nomeArquivo.isBlank() || nomeArquivo.contains("/") || nomeArquivo.contains("..")) {
            return;
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseUrl + "/storage/v1/object/" + bucket + "/" + nomeArquivo))
                .header("apikey", supabaseServiceKey)
                .header("Authorization", "Bearer " + supabaseServiceRoleJwt)
                .DELETE()
                .build();

        try {
            enviar(request);
        } catch (RuntimeException e) {
            // Falha ao remover a imagem antiga não deve impedir a troca de foto.
        }
    }

    private HttpResponse<String> enviar(HttpRequest request) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro de comunicação com o Supabase Storage", e);
        }
    }

    private boolean assinaturaCondizComTipo(byte[] bytes, String contentType) {
        return switch (contentType) {
            case "image/png" -> bytes.length >= 8
                    && (bytes[0] & 0xFF) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G';
            case "image/jpeg" -> bytes.length >= 3
                    && (bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF;
            case "image/webp" -> bytes.length >= 12
                    && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                    && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
            default -> false;
        };
    }
}
