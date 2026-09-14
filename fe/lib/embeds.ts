// Detecta se uma URL de link pertence a um provedor com suporte a embed
// (conteúdo incorporado na página pública) e monta os dados necessários
// pra renderizar. YouTube e Spotify são resolvidos só com regras de URL
// (nenhuma chamada de rede). Instagram não oferece uma URL de iframe
// pública — o jeito oficial é o widget deles (blockquote + embed.js), por
// isso o formato de retorno é diferente pra esse provedor.
//
// Perfis do Instagram não têm um embed público oficial (só posts/reels
// individuais) — precisaria da Graph API com token de acesso e app
// revisado pela Meta, fora do escopo de um link-in-bio. Por isso só
// posts e reels são suportados aqui.

export type ProvedorEmbed = "youtube" | "spotify" | "instagram";

export type InfoEmbed =
  | { tipo: "iframe"; provedor: "youtube" | "spotify"; embedUrl: string; altura: number }
  | { tipo: "instagram"; provedor: "instagram"; permalink: string };

function extrairYoutubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    return url.pathname.slice(1).split("/")[0] || null;
  }
  if (url.hostname.includes("youtube.com")) {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const shorts = url.pathname.match(/^\/shorts\/([^/]+)/);
    if (shorts) return shorts[1];
    const embed = url.pathname.match(/^\/embed\/([^/]+)/);
    if (embed) return embed[1];
  }
  return null;
}

function extrairSpotify(url: URL): { tipo: string; id: string } | null {
  if (!url.hostname.includes("open.spotify.com")) return null;
  const match = url.pathname.match(/^\/(track|album|playlist|episode|show|artist)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return { tipo: match[1], id: match[2] };
}

function extrairInstagramPost(url: URL): string | null {
  if (!url.hostname.includes("instagram.com")) return null;
  const match = url.pathname.match(/^\/(p|reel|reels)\/([^/]+)/);
  if (!match) return null;
  const tipo = match[1] === "reels" ? "reel" : match[1];
  return `https://www.instagram.com/${tipo}/${match[2]}/`;
}

export function detectarEmbed(urlBruta: string, compacto = false): InfoEmbed | null {
  let url: URL;
  try {
    url = new URL(urlBruta);
  } catch {
    return null;
  }

  const youtubeId = extrairYoutubeId(url);
  if (youtubeId) {
    return {
      tipo: "iframe",
      provedor: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      altura: compacto ? 100 : 200,
    };
  }

  const spotify = extrairSpotify(url);
  if (spotify) {
    // O player do Spotify é responsivo: numa altura bem baixa (~80px) ele
    // já vira uma barra compacta de um layout só, sem precisar de outra URL.
    const alturaGrande = spotify.tipo === "track" || spotify.tipo === "episode" ? 152 : 352;
    return {
      tipo: "iframe",
      provedor: "spotify",
      embedUrl: `https://open.spotify.com/embed/${spotify.tipo}/${spotify.id}`,
      altura: compacto ? 80 : alturaGrande,
    };
  }

  const instagramPermalink = extrairInstagramPost(url);
  if (instagramPermalink) {
    // Sempre sem legenda/comentários — só a mídia do post. O toggle de
    // "compacto" não se aplica ao Instagram (o widget deles não tem uma
    // versão "grande" equivalente à dos outros provedores).
    return {
      tipo: "instagram",
      provedor: "instagram",
      permalink: instagramPermalink,
    };
  }

  return null;
}
