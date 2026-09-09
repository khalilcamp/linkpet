package com.lkclone.be.repository;

import com.lkclone.be.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> getUsuarioByUserName(String userName);

    Optional<Usuario> getUsuarioByUserEmail(String userEmail);

    boolean existsByUserName(String userName);

    boolean existsByUserEmail(String userEmail);
}
