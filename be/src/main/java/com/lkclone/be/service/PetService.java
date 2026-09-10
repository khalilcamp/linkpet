package com.lkclone.be.service;

import com.lkclone.be.exception.RecursoNaoEncontradoException;
import com.lkclone.be.model.Pet;
import com.lkclone.be.model.PetLikeLog;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.repository.PetLikeLogRepository;
import com.lkclone.be.repository.PetRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

@Service
public class PetService {

    private static final int XP_POR_LIKE = 10;

    private static final Set<String> CORES_PERMITIDAS = Set.of("laranja", "azul", "verde", "rosa", "roxo", "cinza");
    private static final Set<String> CHAPEUS_PERMITIDOS = Set.of("nenhum", "festa", "coroa", "bone", "capacete_skyrim");
    private static final Set<String> ROSTOS_PERMITIDOS = Set.of("nenhum", "oculos", "oculos_sol", "bigode");
    private static final Set<String> ACESSORIOS_PERMITIDOS = Set.of("nenhum", "gravata", "cachecol", "colar");

    // Itens de customização exclusivos: só quem tem a badge correspondente
    // pode escolher. Pra liberar um novo item exclusivo, basta adicionar aqui
    // e conceder a badge ao usuário (ver BadgeService).
    private static final Map<String, String> CHAPEUS_EXCLUSIVOS = Map.of(
            "capacete_skyrim", BadgeService.BADGE_SKYRIM_RP
    );

    private PetRepository petRepository;
    private PetLikeLogRepository petLikeLogRepository;
    private MensagemService mensagemService;

    public PetService(PetRepository petRepository, PetLikeLogRepository petLikeLogRepository, MensagemService mensagemService) {
        this.petRepository = petRepository;
        this.petLikeLogRepository = petLikeLogRepository;
        this.mensagemService = mensagemService;
    }

    public Pet criarPetParaUsuario(Usuario usuario) {
        Pet pet = new Pet();
        pet.setUsuario(usuario);
        pet.setEspecie("gato");
        pet.setCor("laranja");
        pet.setXp(0);
        pet.setChapeu("nenhum");
        pet.setRosto("nenhum");
        pet.setAcessorioCorpo("nenhum");

        return petRepository.save(pet);
    }

    public Pet buscarPetPorUsuario(Usuario usuario) {
        return petRepository.getPetByUsuario(usuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException(mensagemService.get("erro.pet.naoEncontrado")));
    }

    public Pet customizarPet(Usuario usuario, String cor, String chapeu, String rosto, String acessorioCorpo) {
        if (cor == null || !CORES_PERMITIDAS.contains(cor)) {
            throw new IllegalArgumentException(mensagemService.get("erro.pet.corInvalida", CORES_PERMITIDAS));
        }
        if (chapeu == null || !CHAPEUS_PERMITIDOS.contains(chapeu)) {
            throw new IllegalArgumentException(mensagemService.get("erro.pet.chapeuInvalido", CHAPEUS_PERMITIDOS));
        }
        if (rosto == null || !ROSTOS_PERMITIDOS.contains(rosto)) {
            throw new IllegalArgumentException(mensagemService.get("erro.pet.rostoInvalido", ROSTOS_PERMITIDOS));
        }
        if (acessorioCorpo == null || !ACESSORIOS_PERMITIDOS.contains(acessorioCorpo)) {
            throw new IllegalArgumentException(mensagemService.get("erro.pet.acessorioInvalido", ACESSORIOS_PERMITIDOS));
        }
        String badgeNecessaria = CHAPEUS_EXCLUSIVOS.get(chapeu);
        if (badgeNecessaria != null && !usuario.getUserBadges().contains(badgeNecessaria)) {
            throw new IllegalArgumentException(mensagemService.get("erro.pet.itemExclusivo"));
        }

        Pet pet = buscarPetPorUsuario(usuario);
        pet.setCor(cor);
        pet.setChapeu(chapeu);
        pet.setRosto(rosto);
        pet.setAcessorioCorpo(acessorioCorpo);

        return petRepository.save(pet);
    }

    public ResultadoCurtida curtir(Usuario usuario, String visitorId) {
        Pet pet = buscarPetPorUsuario(usuario);
        LocalDate hoje = LocalDate.now();

        boolean jaCurtiu = petLikeLogRepository.existsByPetAndVisitorIdAndCurtidaData(pet, visitorId, hoje);

        if (!jaCurtiu) {
            PetLikeLog log = new PetLikeLog();
            log.setPet(pet);
            log.setVisitorId(visitorId);
            log.setCurtidaData(hoje);

            try {
                petLikeLogRepository.save(log);
                pet.setXp(pet.getXp() + XP_POR_LIKE);
                pet = petRepository.save(pet);
            } catch (DataIntegrityViolationException e) {
                jaCurtiu = true;
            }
        }

        return new ResultadoCurtida(pet, jaCurtiu);
    }

    public int calcularNivel(int xp) {
        return xp / 100;
    }

    public int calcularEstagio(int xp) {
        if (xp >= 500) {
            return 2;
        }
        if (xp >= 100) {
            return 1;
        }
        return 0;
    }

    public static class ResultadoCurtida {

        private final Pet pet;
        private final boolean jaCurtiuHoje;

        public ResultadoCurtida(Pet pet, boolean jaCurtiuHoje) {
            this.pet = pet;
            this.jaCurtiuHoje = jaCurtiuHoje;
        }

        public Pet getPet() {
            return pet;
        }

        public boolean isJaCurtiuHoje() {
            return jaCurtiuHoje;
        }
    }
}
