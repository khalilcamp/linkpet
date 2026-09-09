package com.lkclone.be.repository;

import com.lkclone.be.model.Link;
import com.lkclone.be.model.LinkCliqueLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LinkCliqueLogRepository extends JpaRepository<LinkCliqueLog, Long> {
    Optional<LinkCliqueLog> findByLinkAndData(Link link, LocalDate data);

    List<LinkCliqueLog> findByLinkAndDataGreaterThanEqual(Link link, LocalDate desde);
}
