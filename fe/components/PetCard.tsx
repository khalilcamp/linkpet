"use client";

import { useState } from "react";
import { curtirPet, PetResponseDTO } from "@/lib/api";
import PetSvg from "./PetSvg";

interface PetCardProps {
  username: string;
  pet: PetResponseDTO;
  cardClassName?: string;
  subtextoClassName?: string;
}

export default function PetCard({
  username,
  pet,
  cardClassName = "border-neutral-800 bg-neutral-900",
  subtextoClassName = "text-neutral-400",
}: PetCardProps) {
  const [estado, setEstado] = useState(pet);
  const [curtindo, setCurtindo] = useState(false);
  const [jaCurtiuHoje, setJaCurtiuHoje] = useState(false);
  const [comemorando, setComemorando] = useState(false);

  async function handleCurtir() {
    setCurtindo(true);
    try {
      const resultado = await curtirPet(username);
      setEstado((atual) => ({
        ...atual,
        xp: resultado.xp,
        nivel: resultado.nivel,
        estagioVisual: resultado.estagioVisual,
      }));
      setJaCurtiuHoje(resultado.jaCurtiuHoje);

      setComemorando(true);
      setTimeout(() => setComemorando(false), 1400);
    } finally {
      setCurtindo(false);
    }
  }

  return (
    <div className={`rounded-xl border p-5 text-center ${cardClassName}`}>
      <PetSvg
        cor={estado.cor}
        estagioVisual={estado.estagioVisual}
        chapeu={estado.chapeu}
        rosto={estado.rosto}
        acessorioCorpo={estado.acessorioCorpo}
        comemorando={comemorando}
        className="mx-auto h-24 w-24 transition-transform"
      />
      <p className={`mt-2 text-sm ${subtextoClassName}`}>
        Nível {estado.nivel} · {estado.xp} XP
      </p>
      <button
        onClick={handleCurtir}
        disabled={curtindo || jaCurtiuHoje}
        className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
      >
        {jaCurtiuHoje ? "Amor o suficiente por hoje!" : curtindo ? "..." : "Amei"}
      </button>
    </div>
  );
}
