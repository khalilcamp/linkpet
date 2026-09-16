// Paleta fixa de temas — mantida em sincronia com o Set de temas permitidos
// no backend (UsuarioService.TEMAS_PERMITIDOS). Um valor fora dessa lista é
// rejeitado pelo backend antes de chegar aqui.

import type { CSSProperties } from "react";

export const TEMAS_DISPONIVEIS = ["escuro", "claro", "roxo", "verde", "sunset", "octacore"] as const;

export type Tema = (typeof TEMAS_DISPONIVEIS)[number];

export const TEMA_LABEL: Record<Tema, string> = {
  escuro: "Escuro",
  claro: "Claro",
  roxo: "Roxo",
  verde: "Verde",
  sunset: "Sunset",
  octacore: "Octacore",
};

export interface TemaClasses {
  fundo: string;
  texto: string;
  subtexto: string;
  card: string;
  cardHover: string;
  // Só preenchidos pro tema "custom" — a cor vem do banco (runtime), então
  // não dá pra virar classe Tailwind estática (o compilador não a vê em
  // build-time). Aplicados como style inline, mesclados na classe acima.
  estiloFundo?: CSSProperties;
  estiloCard?: CSSProperties;
}

export const TEMA_CLASSES: Record<Tema, TemaClasses> = {
  escuro: {
    fundo: "bg-neutral-950",
    texto: "text-white",
    subtexto: "text-neutral-500",
    card: "border-neutral-800 bg-neutral-900",
    cardHover: "hover:border-neutral-600 hover:bg-neutral-800",
  },
  claro: {
    fundo: "bg-neutral-100",
    texto: "text-neutral-900",
    subtexto: "text-neutral-500",
    card: "border-neutral-300 bg-white",
    cardHover: "hover:border-neutral-400 hover:bg-neutral-50",
  },
  roxo: {
    fundo: "bg-gradient-to-b from-purple-950 to-neutral-950",
    texto: "text-white",
    subtexto: "text-purple-300",
    card: "border-purple-800/50 bg-purple-950/40",
    cardHover: "hover:border-purple-500 hover:bg-purple-900/40",
  },
  verde: {
    fundo: "bg-gradient-to-b from-emerald-950 to-neutral-950",
    texto: "text-white",
    subtexto: "text-emerald-300",
    card: "border-emerald-800/50 bg-emerald-950/40",
    cardHover: "hover:border-emerald-500 hover:bg-emerald-900/40",
  },
  sunset: {
    fundo: "bg-gradient-to-b from-orange-900 via-rose-900 to-neutral-950",
    texto: "text-white",
    subtexto: "text-orange-200",
    card: "border-orange-700/50 bg-black/20",
    cardHover: "hover:border-orange-400 hover:bg-black/30",
  },
  // Tema exclusivo do colab Octacore (badge "octacore") — dois spotlights nas
  // cores da marca, em cantos opostos: vermelho embaixo à esquerda, teal (cor
  // da mascote-polvo) em cima à direita. O teal é mais fraco/menor que o
  // vermelho de propósito — sozinhos os dois em opacidade igual, o teal
  // "grita" mais que o vermelho (o olho é mais sensível a ciano que a
  // vermelho escuro), então essa diferença é o que faz o preto dominar no
  // meio e as duas cores lerem como equilibradas. Igual ao "custom", usa
  // estiloFundo pro gradiente em camadas que uma classe Tailwind sozinha não
  // faz.
  octacore: {
    fundo: "bg-black",
    texto: "text-white",
    subtexto: "text-neutral-400",
    card: "border-red-900/60 bg-black/70",
    cardHover: "hover:border-teal-400/70 hover:bg-red-950/40",
    estiloFundo: {
      backgroundColor: "#050505",
      backgroundImage:
        "radial-gradient(ellipse at 85% 0%, rgba(20,184,166,0.32), transparent 48%), radial-gradient(ellipse at 15% 100%, rgba(153,20,20,0.6), transparent 58%)",
    },
  },
};

function classesDoTemaCustom(cor: string): TemaClasses {
  return {
    fundo: "bg-neutral-950",
    texto: "text-white",
    subtexto: "text-neutral-400",
    card: "border-neutral-800 bg-neutral-900",
    cardHover: "hover:border-neutral-600 hover:bg-neutral-800",
    estiloFundo: {
      backgroundImage: `radial-gradient(circle at 50% 0%, ${cor}33, transparent 70%)`,
    },
    estiloCard: {
      borderColor: `${cor}55`,
    },
  };
}

export function classesDoTema(tema: string | undefined, corPersonalizada?: string | null): TemaClasses {
  if (tema === "custom" && corPersonalizada) {
    return classesDoTemaCustom(corPersonalizada);
  }
  if (tema && (TEMAS_DISPONIVEIS as readonly string[]).includes(tema)) {
    return TEMA_CLASSES[tema as Tema];
  }
  return TEMA_CLASSES.escuro;
}
