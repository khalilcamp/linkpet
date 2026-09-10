// Catálogo de tags de auto-declaração ("Eu sou..."), espelhando o whitelist
// do PerfilTagService no backend. Nomes/descrições vêm das traduções
// (namespace "perfilTags"), agrupadas aqui só pra organizar a UI.

export const TAGS_MAXIMO = 6;

export const GRUPOS_TAGS = {
  profissao: [
    "developer",
    "designer",
    "artist",
    "illustrator",
    "photographer",
    "video_editor",
    "music_producer",
    "writer",
    "game_dev",
    "streamer",
    "vtuber",
    "cosplayer",
    "roleplayer",
  ],
  disponibilidade: [
    "commissions_open",
    "commissions_closed",
    "freelancer_available",
    "job_hunting",
    "open_to_collab",
  ],
  comunidade: ["volunteer", "mentor", "lgbtq_friendly"],
} as const;

export const TAGS_DISPONIVEIS = Object.values(GRUPOS_TAGS).flat();
