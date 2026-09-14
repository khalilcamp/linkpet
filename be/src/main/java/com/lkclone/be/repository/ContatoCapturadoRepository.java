package com.lkclone.be.repository;

import com.lkclone.be.model.ContatoCapturado;
import com.lkclone.be.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContatoCapturadoRepository extends JpaRepository<ContatoCapturado, Long> {
    List<ContatoCapturado> findByUsuarioOrderByCriadoEmDesc(Usuario usuario);
}
