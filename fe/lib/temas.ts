// Paleta fixa de temas — mantida em sincronia com o Set de temas permitidos
// no backend (UsuarioService.TEMAS_PERMITIDOS). Um valor fora dessa lista é
// rejeitado pelo backend antes de chegar aqui.

export const TEMAS_DISPONIVEIS = ["escuro", "claro", "roxo", "verde", "sunset"] as const;

export type Tema = (typeof TEMAS_DISPONIVEIS)[number];

export const TEMA_LABEL: Record<Tema, string> = {
  escuro: "Escuro",
  claro: "Claro",
  roxo: "Roxo",
  verde: "Verde",
  sunset: "Sunset",
};

interface TemaClasses {
  fundo: string;
  texto: string;
  subtexto: string;
  card: string;
  cardHover: string;
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
};

export function classesDoTema(tema: string | undefined): TemaClasses {
  if (tema && (TEMAS_DISPONIVEIS as readonly string[]).includes(tema)) {
    return TEMA_CLASSES[tema as Tema];
  }
  return TEMA_CLASSES.escuro;
}
