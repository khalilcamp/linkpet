package com.lkclone.be.repository;

import com.lkclone.be.model.Pet;
import com.lkclone.be.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {

    Optional<Pet> getPetByUsuario(Usuario usuario);
}
