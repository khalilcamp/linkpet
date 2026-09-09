package com.lkclone.be.controller;

import com.lkclone.be.dto.CustomizarPetDTO;
import com.lkclone.be.dto.PetResponseDTO;
import com.lkclone.be.model.Pet;
import com.lkclone.be.model.Usuario;
import com.lkclone.be.service.PetService;
import com.lkclone.be.service.UsuarioService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios/{usuarioId}/pet")
public class PetController {

    private final PetService petService;
    private final UsuarioService usuarioService;

    public PetController(PetService petService, UsuarioService usuarioService) {
        this.petService = petService;
        this.usuarioService = usuarioService;
    }

    @PutMapping
    public PetResponseDTO customizar(@PathVariable Long usuarioId, @RequestBody CustomizarPetDTO dados, Authentication authentication) {
        Usuario dono = usuarioService.buscarPorId(usuarioId);
        if (!dono.getUserName().equals(authentication.getName())) {
            throw new AccessDeniedException("Você não pode editar o pet de outro usuário");
        }

        Pet pet = petService.customizarPet(dono, dados.getCor(), dados.getChapeu(), dados.getRosto(), dados.getAcessorioCorpo());

        return new PetResponseDTO(pet.getId(), pet.getEspecie(), pet.getCor(), pet.getXp(),
                petService.calcularNivel(pet.getXp()), petService.calcularEstagio(pet.getXp()),
                pet.getChapeu(), pet.getRosto(), pet.getAcessorioCorpo());
    }
}
