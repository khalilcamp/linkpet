package com.lkclone.be.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "link_clique_log")
public class LinkCliqueLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "link_id")
    private Link link;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private Long quantidade;
}
