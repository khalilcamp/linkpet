package com.lkclone.be.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${brevo.api-key}")
    private String apiKey;

    @Value("${brevo.from-email}")
    private String fromEmail;

    @Value("${brevo.from-name:LinkPet}")
    private String fromName;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void enviarEmailConfirmacao(String destinatario, String link) {
        String assunto = "Confirme seu e-mail no LinkPet";
        String html = """
                <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                    <p style="color: #f97316; font-weight: 700; font-size: 18px; margin: 0 0 24px;">LinkPet</p>
                    <h1 style="font-size: 20px; color: #111; margin: 0 0 12px;">Confirme seu e-mail</h1>
                    <p style="color: #444; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                        Falta pouco para começar a usar o LinkPet. Clique no botão abaixo para confirmar seu e-mail.
                    </p>
                    <a href="%s" style="display: inline-block; background: #f97316; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">Confirmar e-mail</a>
                    <p style="color: #999; font-size: 12px; margin: 24px 0 0;">
                        Se você não criou uma conta no LinkPet, pode ignorar este e-mail.
                    </p>
                </div>
                """.formatted(link);

        enviar(destinatario, assunto, html);
    }

    public void enviarEmailRedefinicaoSenha(String destinatario, String link) {
        String assunto = "Redefinição de senha - LinkPet";
        String html = """
                <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                    <p style="color: #f97316; font-weight: 700; font-size: 18px; margin: 0 0 24px;">LinkPet</p>
                    <h1 style="font-size: 20px; color: #111; margin: 0 0 12px;">Redefinir senha</h1>
                    <p style="color: #444; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                        Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha. Esse link expira em 1 hora.
                    </p>
                    <a href="%s" style="display: inline-block; background: #f97316; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">Redefinir senha</a>
                    <p style="color: #999; font-size: 12px; margin: 24px 0 0;">
                        Se você não pediu essa redefinição, pode ignorar este e-mail.
                    </p>
                </div>
                """.formatted(link);

        enviar(destinatario, assunto, html);
    }

    private void enviar(String destinatario, String assunto, String html) {
        try {
            String corpo = """
                    {"sender":{"name":"%s","email":"%s"},"to":[{"email":"%s"}],"subject":"%s","htmlContent":"%s"}
                    """.formatted(escaparJson(fromName), escaparJson(fromEmail), escaparJson(destinatario),
                    escaparJson(assunto), escaparJson(html));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(corpo))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                logger.error("Erro ao enviar e-mail via Brevo para {}: {}", destinatario, response.body());
            }
        } catch (IOException e) {
            logger.error("Erro de comunicação com o Brevo", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("Erro de comunicação com o Brevo", e);
        }
    }

    private String escaparJson(String valor) {
        return valor
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
