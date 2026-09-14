package com.lkclone.be.config;

import com.lkclone.be.exception.CredenciaisInvalidasException;
import com.lkclone.be.exception.RateLimitExcedidoException;
import com.lkclone.be.exception.RecursoNaoEncontradoException;
import com.lkclone.be.service.MensagemService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final MensagemService mensagemService;

    public GlobalExceptionHandler(MensagemService mensagemService) {
        this.mensagemService = mensagemService;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> tratarIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<Map<String, String>> tratarNaoEncontrado(RecursoNaoEncontradoException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<Map<String, String>> tratarCredenciaisInvalidas(CredenciaisInvalidasException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(RateLimitExcedidoException.class)
    public ResponseEntity<Map<String, String>> tratarRateLimit(RateLimitExcedidoException e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> tratarValidacao(MethodArgumentNotValidException e) {
        String mensagem = e.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", mensagem));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> tratarArquivoGrande(MaxUploadSizeExceededException e) {
        // Sem isso, o limite do multipart estoura antes de chegar no
        // controller: o Tomcat interrompe a conexão no meio do envio e o
        // proxy da Render devolve um 502 sem header de CORS — o navegador
        // reporta como erro de CORS em vez do 413 que era pra ser.
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("message", mensagemService.get("erro.arquivo.tamanhoMaximo")));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> tratarIntegridade(DataIntegrityViolationException e) {
        // Rede de segurança contra corridas: a checagem prévia de duplicidade
        // (ex: cadastrarUsuario) evita a maioria dos casos, mas duas
        // requisições simultâneas ainda podem colidir na constraint do banco.
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", mensagemService.get("erro.dadoJaEmUso")));
    }
}
