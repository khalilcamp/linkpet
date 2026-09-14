package com.lkclone.be.repository;

import com.lkclone.be.model.Usuario;
import com.lkclone.be.model.VisualizacaoPerfil;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface VisualizacaoPerfilRepository extends JpaRepository<VisualizacaoPerfil, Long> {
    List<VisualizacaoPerfil> findByUsuarioAndDataHoraGreaterThanEqual(Usuario usuario, LocalDateTime desde);
}
