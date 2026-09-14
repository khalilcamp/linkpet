// Fonte e estilo de botão da página pública — mantidos em sincronia com o
// Set de valores permitidos no backend (UsuarioService).

export const FONTES_DISPONIVEIS = ["padrao", "serif", "mono", "arredondada"] as const;
export type Fonte = (typeof FONTES_DISPONIVEIS)[number];

// As variáveis --font-* são declaradas no layout raiz (next/font só carrega
// fontes definidas em build-time).
const FONTE_VAR: Record<Fonte, string> = {
  padrao: "var(--font-geist-sans)",
  serif: "var(--font-playfair)",
  mono: "var(--font-geist-mono)",
  arredondada: "var(--font-fredoka)",
};

export function fontFamilyDaFonte(fonte: string | undefined): string {
  if (fonte && (FONTES_DISPONIVEIS as readonly string[]).includes(fonte)) {
    return FONTE_VAR[fonte as Fonte];
  }
  return FONTE_VAR.padrao;
}

export const FORMATOS_BOTAO_DISPONIVEIS = ["quadrado", "arredondado", "pill"] as const;
export type FormatoBotao = (typeof FORMATOS_BOTAO_DISPONIVEIS)[number];

const FORMATO_BOTAO_CLASSE: Record<FormatoBotao, string> = {
  quadrado: "rounded-none",
  arredondado: "rounded-xl",
  pill: "rounded-full",
};

export function classeFormatoBotao(formato: string | undefined): string {
  if (formato && (FORMATOS_BOTAO_DISPONIVEIS as readonly string[]).includes(formato)) {
    return FORMATO_BOTAO_CLASSE[formato as FormatoBotao];
  }
  return FORMATO_BOTAO_CLASSE.arredondado;
}

export const ESTILOS_BOTAO_DISPONIVEIS = ["preenchido", "contorno", "sombra"] as const;
export type EstiloBotao = (typeof ESTILOS_BOTAO_DISPONIVEIS)[number];

// "!" (important do Tailwind) garante que isso vence as classes de fundo/
// borda do tema, que já vêm como uma string fixa (não dá pra remover só o
// "bg-*" dali sem reescrever o sistema de tema inteiro).
const ESTILO_BOTAO_CLASSE: Record<EstiloBotao, string> = {
  preenchido: "",
  contorno: "!bg-transparent border-2",
  sombra: "shadow-lg shadow-black/30",
};

export function classeEstiloBotao(estilo: string | undefined): string {
  if (estilo && (ESTILOS_BOTAO_DISPONIVEIS as readonly string[]).includes(estilo)) {
    return ESTILO_BOTAO_CLASSE[estilo as EstiloBotao];
  }
  return ESTILO_BOTAO_CLASSE.preenchido;
}
