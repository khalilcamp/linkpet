package com.lkclone.be.repository;

import com.lkclone.be.model.Link;
import com.lkclone.be.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LinkRepository extends JpaRepository<Link, Long> {
    List<Link> getLinkByUsuario(Usuario usuario);
}
