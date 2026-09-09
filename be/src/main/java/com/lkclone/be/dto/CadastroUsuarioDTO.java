package com.lkclone.be.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CadastroUsuarioDTO {

    @NotBlank(message = "Informe um nome de usuário")
    @Size(min = 3, max = 50, message = "O nome de usuário deve ter entre 3 e 50 caracteres")
    private String userName;

    @NotBlank(message = "Informe um e-mail")
    @Email(message = "Informe um e-mail válido")
    private String userEmail;

    @NotBlank(message = "Informe uma senha")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
            message = "A senha deve ter no mínimo 8 caracteres e conter letras e números")
    private String senha;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}
