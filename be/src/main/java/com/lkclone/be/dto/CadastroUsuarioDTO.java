package com.lkclone.be.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CadastroUsuarioDTO {

    @NotBlank(message = "{validation.username.blank}")
    @Size(min = 3, max = 50, message = "{validation.username.size}")
    private String userName;

    @NotBlank(message = "{validation.email.blank}")
    @Email(message = "{validation.email.invalid}")
    private String userEmail;

    @NotBlank(message = "{validation.senha.blank}")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
            message = "{validation.senha.pattern}")
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
