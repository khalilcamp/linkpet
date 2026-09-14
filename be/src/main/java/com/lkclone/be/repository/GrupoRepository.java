package com.lkclone.be.repository;

import com.lkclone.be.model.Grupo;
import com.lkclone.be.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {
    List<Grupo> findByUsuario(Usuario usuario);
}
