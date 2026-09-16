import { useId } from "react";

export const CORES: Record<string, string> = {
  laranja: "#f97316",
  azul: "#3b82f6",
  verde: "#22c55e",
  rosa: "#ec4899",
  roxo: "#a855f7",
  cinza: "#9ca3af",
};

export const CORES_DISPONIVEIS = Object.keys(CORES);

export const CHAPEUS_DISPONIVEIS = ["nenhum", "festa", "coroa", "bone", "capacete_skyrim", "octacore"];
export const ROSTOS_DISPONIVEIS = ["nenhum", "oculos", "oculos_sol", "bigode"];
export const ACESSORIOS_CORPO_DISPONIVEIS = ["nenhum", "gravata", "cachecol", "colar"];

const CASCO = "#f8fafc"; // corpo liso e branco, estilo EVE
const CASCO_SOMBRA = "#dbe2ea";

interface PetSvgProps {
  cor: string;
  estagioVisual: number; // 0 = sonolento, 1 = feliz, 2 = radiante
  chapeu?: string;
  rosto?: string;
  acessorioCorpo?: string;
  comemorando?: boolean; // levanta os bracinhos por um instante, ao receber uma curtida
  className?: string;
}

export default function PetSvg({
  cor,
  estagioVisual,
  chapeu = "nenhum",
  rosto = "nenhum",
  acessorioCorpo = "nenhum",
  comemorando = false,
  className,
}: PetSvgProps) {
  const acento = CORES[cor] ?? CORES.laranja;
  const dormindo = estagioVisual === 0;
  const radiante = estagioVisual === 2;
  const gradId = `pet-corpo-${useId().replace(/:/g, "")}`;
  // O chapéu Octacore vem com o próprio esquema de cor pro corpo — a parte
  // de cima (mais opaca) puxa pro teal da mascote, a de baixo (mais
  // transparente) puxa pro vermelho, ecoando o tema exclusivo da badge.
  const octacoreAtivo = chapeu === "octacore";
  // Só o topo arredondado do corpo (a cúpula) fica mais estreito com o
  // Octacore, pra não vazar pros lados por baixo do polvo — a base ondulada
  // continua na largura normal, só afunilando pra se encontrar com a cúpula
  // mais estreita (efeito de "ombros"), em vez de encolher o fantasma inteiro.
  const cupula = octacoreAtivo ? "M35,35 A17.5,17.5 0 0 1 65,35" : "M21,35 A29,29 0 0 1 79,35";
  const fechoCupula = octacoreAtivo ? "L35,35 Z" : "L21,35 Z";
  const ondaBase1 = "L79,82 q-7.25,7 -14.5,0 q-7.25,-7 -14.5,0 q-7.25,7 -14.5,0 q-7.25,-7 -14.5,0 ";
  const ondaBase2 = "L79,82 q-7.25,-7 -14.5,0 q-7.25,7 -14.5,0 q-7.25,-7 -14.5,0 q-7.25,7 -14.5,0 ";
  const corpoPathD = `${cupula} ${ondaBase1}${fechoCupula}`;
  const corpoAnimValues = `${cupula} ${ondaBase1}${fechoCupula};${cupula} ${ondaBase2}${fechoCupula};${cupula} ${ondaBase1}${fechoCupula}`;

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Pet robô" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          {octacoreAtivo ? (
            <>
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
              <stop offset="55%" stopColor="#14b8a6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.3} />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor={CASCO} stopOpacity={1} />
              <stop offset="55%" stopColor={CASCO} stopOpacity={0.85} />
              <stop offset="100%" stopColor={CASCO} stopOpacity={0.2} />
            </>
          )}
        </linearGradient>
      </defs>

      {/* brilho no chão — fica parado enquanto o corpo flutua por cima, reforça a ilusão */}
      <ellipse cx="50" cy="93" rx="18" ry="3.5" fill={acento} opacity={0.25} />

      <g className="pet-flutuar">
      {/* cabeça um pouco mais fina só com o capacete do Skyrim — ele é largo
          e "engorda" a silhueta se o corpo continuar na largura normal */}
      <g style={chapeu === "capacete_skyrim" ? { transform: "scaleX(0.92)", transformOrigin: "50px 50px" } : undefined}>
        {radiante && (
          <g className="animate-pulse" opacity={0.8}>
            <path d="M12 30 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z" fill={acento} />
            <path d="M88 24 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" fill={acento} />
          </g>
        )}

        {/* bracinhos, só aparecem animado/radiante — sobem quando recebe uma curtida */}
        {radiante && (
          <>
            <rect
              x="4"
              y="46"
              width="16"
              height="7"
              rx="3.5"
              fill={CASCO}
              stroke={CASCO_SOMBRA}
              strokeWidth="1.5"
              style={{
                transformOrigin: "20px 49.5px",
                transform: comemorando ? "rotate(-35deg)" : "rotate(35deg)",
                transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
            <rect
              x="80"
              y="46"
              width="16"
              height="7"
              rx="3.5"
              fill={CASCO}
              stroke={CASCO_SOMBRA}
              strokeWidth="1.5"
              style={{
                transformOrigin: "80px 49.5px",
                transform: comemorando ? "rotate(35deg)" : "rotate(-35deg)",
                transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </>
        )}

        {/* corpo: fantasminha - topo arredondado, base ondulada e animada, gradiente esmaecendo pra baixo */}
        <path fill={`url(#${gradId})`} stroke={CASCO_SOMBRA} strokeWidth="1.5" d={corpoPathD}>
          <animate
            attributeName="d"
            dur="3s"
            repeatCount="indefinite"
            values={corpoAnimValues}
          />
        </path>

        {/* reflexo sutil */}
        <ellipse cx="38" cy="26" rx="10" ry="16" fill="#ffffff" opacity={0.5} />

        {/* bochechas */}
        <ellipse cx="30" cy="48" rx="5" ry="3.5" fill={acento} opacity={0.25} />
        <ellipse cx="70" cy="48" rx="5" ry="3.5" fill={acento} opacity={0.25} />

        {/* olhos (LEDs em amêndoa, como a EVE) — fecham felizes ao comemorar */}
        {dormindo ? (
          <>
            <rect x="29" y="41" width="14" height="3" rx="1.5" fill={acento} opacity={0.7} />
            <rect x="57" y="41" width="14" height="3" rx="1.5" fill={acento} opacity={0.7} />
          </>
        ) : (
          <>
            <g
              style={{
                transformOrigin: "36px 41px",
                transform: comemorando ? "scaleY(0.12)" : "scaleY(1)",
                transition: "transform 0.25s ease",
              }}
            >
              <ellipse cx="36" cy="41" rx={radiante ? 9 : 7.5} ry={radiante ? 12 : 10} fill={acento} opacity={0.18} />
              <ellipse cx="36" cy="41" rx={radiante ? 6.5 : 5.5} ry={radiante ? 9 : 7.5} fill={acento} />
              <circle cx="34" cy="37" r="1.6" fill="#ffffff" opacity={0.9} />
            </g>
            <g
              style={{
                transformOrigin: "64px 41px",
                transform: comemorando ? "scaleY(0.12)" : "scaleY(1)",
                transition: "transform 0.25s ease",
              }}
            >
              <ellipse cx="64" cy="41" rx={radiante ? 9 : 7.5} ry={radiante ? 12 : 10} fill={acento} opacity={0.18} />
              <ellipse cx="64" cy="41" rx={radiante ? 6.5 : 5.5} ry={radiante ? 9 : 7.5} fill={acento} />
              <circle cx="62" cy="37" r="1.6" fill="#ffffff" opacity={0.9} />
            </g>
            <g
              style={{
                opacity: comemorando ? 1 : 0,
                transition: comemorando ? "opacity 0.2s ease 0.15s" : "opacity 0.1s ease",
              }}
            >
              <path d="M31,42 Q36,37 41,42" stroke={acento} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M59,42 Q64,37 69,42" stroke={acento} strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </>
        )}

      {/* acessório de rosto */}
      {rosto === "oculos" && (
        <g fill="none" stroke="#1f2937" strokeWidth="2">
          <circle cx="36" cy="41" r="9" />
          <circle cx="64" cy="41" r="9" />
          <path d="M45 41 H55" />
          <path d="M27 39 L22 37" />
          <path d="M73 39 L78 37" />
        </g>
      )}
      {rosto === "oculos_sol" && (
        <g>
          <circle cx="36" cy="41" r="9" fill="#111827" opacity={0.85} />
          <circle cx="64" cy="41" r="9" fill="#111827" opacity={0.85} />
          <path d="M45 41 H55" stroke="#1f2937" strokeWidth="2" fill="none" />
          <path d="M27 39 L22 37" stroke="#1f2937" strokeWidth="2" fill="none" />
          <path d="M73 39 L78 37" stroke="#1f2937" strokeWidth="2" fill="none" />
          <path d="M31 37 L34 35" stroke="#ffffff" strokeWidth="1.5" opacity={0.6} strokeLinecap="round" />
          <path d="M59 37 L62 35" stroke="#ffffff" strokeWidth="1.5" opacity={0.6} strokeLinecap="round" />
        </g>
      )}
      {rosto === "bigode" && (
        <g fill="#3f2d20">
          <path d="M50 56 C46 52 40 52 37 55 C40 54 43 55 45 57 C42 56 39 58 38 60 C42 59 46 58 50 60 Z" />
          <path d="M50 56 C54 52 60 52 63 55 C60 54 57 55 55 57 C58 56 61 58 62 60 C58 59 54 58 50 60 Z" />
        </g>
      )}

      {/* acessório de corpo */}
      {acessorioCorpo === "gravata" && (
        <g>
          <path d="M42 58 L50 63 L42 68 Z" fill="#1e293b" />
          <path d="M58 58 L50 63 L58 68 Z" fill="#1e293b" />
          <rect x="47" y="60" width="6" height="6" rx="1.5" fill="#1e293b" />
        </g>
      )}
      {acessorioCorpo === "cachecol" && (
        <g fill="#dc2626">
          <rect x="30" y="58" width="40" height="9" rx="4.5" />
          <rect x="40" y="65" width="6" height="15" rx="2" />
          <rect x="54" y="65" width="6" height="15" rx="2" />
        </g>
      )}
      {acessorioCorpo === "colar" && (
        <g fill="#fbbf24">
          <circle cx="35" cy="61" r="2.4" />
          <circle cx="42.5" cy="65" r="2.4" />
          <circle cx="50" cy="67" r="3.4" />
          <circle cx="57.5" cy="65" r="2.4" />
          <circle cx="65" cy="61" r="2.4" />
        </g>
      )}
      </g>

      {/* chapéu */}
      {chapeu === "festa" && (
        <g>
          <path d="M38 16 L50 2 L62 16 Z" fill={acento} />
          <circle cx="50" cy="2" r="3" fill="#ffffff" />
          <circle cx="46" cy="11" r="1.5" fill="#ffffff" opacity={0.8} />
          <circle cx="54" cy="8" r="1.5" fill="#ffffff" opacity={0.8} />
        </g>
      )}
      {chapeu === "coroa" && (
        <g>
          <path d="M34 16 L37 4 L44 10 L50 2 L56 10 L63 4 L66 16 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
          <circle cx="37" cy="4" r="1.8" fill={acento} />
          <circle cx="50" cy="2" r="1.8" fill={acento} />
          <circle cx="63" cy="4" r="1.8" fill={acento} />
        </g>
      )}
      {chapeu === "bone" && (
        <g>
          <path d="M29 15 A21 16 0 0 1 71 15 Z" fill={acento} />
          <ellipse cx="40" cy="15.5" rx="15" ry="3" fill={acento} opacity={0.85} />
        </g>
      )}
      {chapeu === "capacete_skyrim" && (
        <image
          href="/helmet.png"
          x="-21"
          y="-25"
          width="142"
          height="120"
          preserveAspectRatio="none"
        />
      )}
      {chapeu === "octacore" && (
        <image
          href="/polvoocta.png"
          x="-10"
          y="-30"
          width="120"
          height="120"
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      </g>
    </svg>
  );
}
