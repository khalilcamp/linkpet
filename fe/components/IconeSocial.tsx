// Ícone de rede social detectado automaticamente pelo domínio da URL do
// link. Puramente visual — nenhuma chamada ao backend. Usa glifos simples
// (não os logos oficiais exatos) pra evitar depender de assets externos.

type Plataforma =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "x"
  | "whatsapp"
  | "facebook"
  | "linkedin"
  | "github"
  | "spotify"
  | "email";

const CORES: Record<Plataforma, string> = {
  instagram: "#E1306C",
  tiktok: "#000000",
  youtube: "#FF0000",
  x: "#000000",
  whatsapp: "#25D366",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  github: "#181717",
  spotify: "#1DB954",
  email: "#6B7280",
};

export function detectarPlataforma(url: string): Plataforma | null {
  if (url.startsWith("mailto:")) return "email";

  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }

  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("tiktok.com")) return "tiktok";
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
  if (host.includes("twitter.com") || host === "x.com") return "x";
  if (host.includes("whatsapp.com") || host.includes("wa.me")) return "whatsapp";
  if (host.includes("facebook.com")) return "facebook";
  if (host.includes("linkedin.com")) return "linkedin";
  if (host.includes("github.com")) return "github";
  if (host.includes("spotify.com")) return "spotify";
  return null;
}

function Glifo({ plataforma }: { plataforma: Plataforma }) {
  switch (plataforma) {
    case "instagram":
      return (
        <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="white" strokeWidth="1.6">
          <title>Instagram</title>
        </rect>
      );
    case "tiktok":
      return (
        <path
          d="M13 4v10.5a2.5 2.5 0 1 1-2-2.45V9.9a4.5 4.5 0 1 0 4 4.47V9c1 .7 2 1 3 1V7.9c-1.5 0-3-1-3-2.9h-2Z"
          fill="white"
        />
      );
    case "youtube":
      return <path d="M9 8.5v7l6-3.5-6-3.5Z" fill="white" />;
    case "x":
      return (
        <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
          X
        </text>
      );
    case "whatsapp":
      return (
        <path
          d="M12 5a7 7 0 0 0-6 10.6L5 19l3.5-1a7 7 0 1 0 3.5-13Zm3.9 9.9c-.2.5-1 .9-1.4 1-.4.1-.8.1-2.3-.5-2-.8-3.3-2.7-3.4-2.9-.1-.1-.8-1.1-.8-2.1s.5-1.5.7-1.7c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .5.4l.6 1.5c.1.1.1.3 0 .4l-.3.4c-.1.1-.2.3-.1.4.2.4.7 1.1 1.4 1.7.7.6 1.3.8 1.5.9.2.1.3.1.4-.1l.6-.6c.2-.2.4-.2.6-.1l1.3.6c.2.1.4.2.4.3.1.2.1.6-.1 1Z"
          fill="white"
        />
      );
    case "facebook":
      return (
        <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">
          f
        </text>
      );
    case "linkedin":
      return (
        <text x="12" y="15.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">
          in
        </text>
      );
    case "github":
      return (
        <path
          d="M12 4.8a7.2 7.2 0 0 0-2.3 14c.35.07.5-.15.5-.35v-1.35c-2 .45-2.45-.85-2.45-.85-.3-.85-.8-1.1-.8-1.1-.65-.45.05-.45.05-.45.75.05 1.1.75 1.1.75.65 1.15 1.7.8 2.1.6.05-.5.25-.8.45-1-1.6-.2-3.3-.8-3.3-3.6 0-.8.3-1.45.75-1.95-.05-.2-.35-1 .1-2.1 0 0 .6-.2 2 .75a6.8 6.8 0 0 1 3.6 0c1.4-.95 2-.75 2-.75.45 1.1.15 1.9.1 2.1.45.5.75 1.15.75 1.95 0 2.8-1.7 3.4-3.3 3.6.25.25.5.7.5 1.4v2.1c0 .2.15.42.5.35A7.2 7.2 0 0 0 12 4.8Z"
          fill="white"
        />
      );
    case "spotify":
      return (
        <path
          d="M7 10.5c2.8-.9 5.6-.7 8 .7M7.3 13c2.3-.7 4.6-.55 6.6.6M7.6 15.4c1.9-.55 3.7-.45 5.2.5"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
      );
    case "email":
      return (
        <path
          d="M5 7.5h14v9H5v-9Zm0 0 7 5.5 7-5.5"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
  }
}

export default function IconeSocial({ url, className = "h-6 w-6" }: { url: string; className?: string }) {
  const plataforma = detectarPlataforma(url);
  if (!plataforma) return null;

  return (
    <svg viewBox="0 0 24 24" className={`rounded ${className}`} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill={CORES[plataforma]} />
      <Glifo plataforma={plataforma} />
    </svg>
  );
}
