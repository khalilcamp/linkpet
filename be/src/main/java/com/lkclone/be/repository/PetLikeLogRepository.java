package com.lkclone.be.repository;

import com.lkclone.be.model.Pet;
import com.lkclone.be.model.PetLikeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface PetLikeLogRepository extends JpaRepository<PetLikeLog, Long> {

    boolean existsByPetAndVisitorIdAndCurtidaData(Pet pet, String visitorId, LocalDate curtidaData);
}
