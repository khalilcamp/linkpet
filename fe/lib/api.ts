// URL base da API Spring Boot. Ajuste se sua aplicação rodar em outra porta.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ---- Tipos espelhando os DTOs do backend ----

export interface UsuarioResponseDTO {
  id: number;
  userName: string;
  userEmail: string;
  userPfp: string | null;
  bio: string | null;
  tema: string;
  corPersonalizada: string | null;
  perfilVisualizacoes: number;
  emailVerificado: boolean;
  captarContato: boolean;
  badges: string[];
  tags: string[];
}

export interface ContatoCapturadoResponseDTO {
  id: number;
  email: string | null;
  whatsapp: string | null;
  criadoEm: string;
}

export interface LinkResponseDTO {
  linkId: number;
  url: string;
  label: string;
  pictureLink: string | null;
  position: number;
  ativo: boolean;
  cliques: number;
  // Datas no formato ISO "yyyy-MM-dd", como o Jackson serializa um LocalDate.
  dataInicio: string | null;
  dataFim: string | null;
  grupoId: number | null;
}

export interface GrupoResponseDTO {
  id: number;
  nome: string;
  posicao: number;
  ativo: boolean;
}

export interface GrupoPublicoDTO {
  nome: string;
  links: LinkResponseDTO[];
}

export interface LinkCliqueDiaDTO {
  data: string;
  quantidade: number;
}

export interface PetResponseDTO {
  petId: number;
  especie: string;
  cor: string;
  xp: number;
  nivel: number;
  estagioVisual: number;
  chapeu: string;
  rosto: string;
  acessorioCorpo: string;
}

export interface PetCurtidaResponseDTO {
  xp: number;
  nivel: number;
  estagioVisual: number;
  jaCurtiuHoje: boolean;
}

export interface PaginaPublicaDTO {
  // O backend não devolve "id" nesse DTO (é dado público). O dashboard usa
  // GET /usuarios/me para obter o id do usuário logado.
  usuarioId?: number;
  userName: string;
  userPfp: string | null;
  bio: string | null;
  tema: string;
  corPersonalizada: string | null;
  linksSemGrupo: LinkResponseDTO[];
  grupos: GrupoPublicoDTO[];
  pet: PetResponseDTO;
  badges: string[];
  tags: string[];
  captarContato: boolean;
}

// ---- Armazenamento do token ----
// Guardado em localStorage por simplicidade. Ponto de evolução futura: mover
// para cookie httpOnly setado pelo backend, mais seguro contra XSS.

const TOKEN_KEY = "linkpet_token";

export function salvarToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function obterToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removerToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ---- Identificação anônima de visitante (para o limite de "joia" por dia) ----

const VISITOR_ID_KEY = "linkpet_visitor_id";

export function obterVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

// Lê o locale resolvido pelo next-intl (cookie setado pelo middleware/geo-IP)
// para repassar ao backend via Accept-Language — garante que as mensagens de
// erro da API saiam no mesmo idioma da página, e não no idioma do navegador.
function obterLocaleAtual(): string {
  if (typeof document === "undefined") return "pt-BR";
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "pt-BR";
}

// ---- Helper central de requisições ----

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = obterToken();

  // Para FormData (upload de arquivo), o navegador precisa definir o
  // Content-Type sozinho (multipart/form-data com boundary).
  const ehFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(ehFormData ? {} : { "Content-Type": "application/json" }),
    "Accept-Language": obterLocaleAtual(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let mensagem = `Erro ${response.status}`;
    try {
      const corpo = await response.json();
      mensagem = corpo.message || corpo.error || mensagem;
    } catch {
      // corpo não veio em JSON, mantém mensagem padrão
    }
    throw new Error(mensagem);
  }

  // Login retorna uma string pura, não JSON. Trata os dois casos.
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text() as unknown as T;
}

// ---- Endpoints ----

export function cadastrarUsuario(dados: {
  userName: string;
  userEmail: string;
  senha: string;
}) {
  return request<UsuarioResponseDTO>("/usuarios", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function login(dados: { userName: string; senha: string }) {
  return request<string>("/usuarios/login", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function esqueciSenha(userEmail: string) {
  return request<void>("/usuarios/esqueci-senha", {
    method: "POST",
    body: JSON.stringify({ userEmail }),
  });
}

export function redefinirSenha(token: string, novaSenha: string) {
  return request<void>("/usuarios/redefinir-senha", {
    method: "POST",
    body: JSON.stringify({ token, novaSenha }),
  });
}

export function confirmarEmail(token: string) {
  return request<void>("/usuarios/confirmar-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function reenviarConfirmacaoEmail(userEmail: string) {
  return request<void>("/usuarios/reenviar-confirmacao", {
    method: "POST",
    body: JSON.stringify({ userEmail }),
  });
}

interface DadosLink {
  url: string;
  label: string;
  pictureLink?: string;
  dataInicio?: string;
  dataFim?: string;
  grupoId?: number;
}

export function criarLink(usuarioId: number, dados: DadosLink) {
  return request<LinkResponseDTO>(`/usuarios/${usuarioId}/links`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function listarLinks(usuarioId: number) {
  return request<LinkResponseDTO[]>(`/usuarios/${usuarioId}/links`);
}

export function atualizarLink(usuarioId: number, linkId: number, dados: DadosLink) {
  return request<LinkResponseDTO>(`/usuarios/${usuarioId}/links/${linkId}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function removerLink(usuarioId: number, linkId: number) {
  return request<void>(`/usuarios/${usuarioId}/links/${linkId}`, {
    method: "DELETE",
  });
}

export function reativarLink(usuarioId: number, linkId: number) {
  return request<LinkResponseDTO>(`/usuarios/${usuarioId}/links/${linkId}/reativar`, {
    method: "PATCH",
  });
}

export function reordenarLinks(usuarioId: number, ordem: number[]) {
  return request<LinkResponseDTO[]>(`/usuarios/${usuarioId}/links/reordenar`, {
    method: "PATCH",
    body: JSON.stringify({ ordem }),
  });
}

export function moverLink(usuarioId: number, linkId: number, grupoId: number | null) {
  return request<LinkResponseDTO>(`/usuarios/${usuarioId}/links/${linkId}/mover`, {
    method: "PATCH",
    body: JSON.stringify({ grupoId }),
  });
}

export function listarGrupos(usuarioId: number) {
  return request<GrupoResponseDTO[]>(`/usuarios/${usuarioId}/grupos`);
}

export function criarGrupo(usuarioId: number, nome: string) {
  return request<GrupoResponseDTO>(`/usuarios/${usuarioId}/grupos`, {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}

export function renomearGrupo(usuarioId: number, grupoId: number, nome: string) {
  return request<GrupoResponseDTO>(`/usuarios/${usuarioId}/grupos/${grupoId}`, {
    method: "PATCH",
    body: JSON.stringify({ nome }),
  });
}

export function alternarGrupoAtivo(usuarioId: number, grupoId: number, ativo: boolean) {
  return request<GrupoResponseDTO>(`/usuarios/${usuarioId}/grupos/${grupoId}/ativo`, {
    method: "PATCH",
    body: JSON.stringify({ ativo }),
  });
}

export function excluirGrupo(usuarioId: number, grupoId: number) {
  return request<void>(`/usuarios/${usuarioId}/grupos/${grupoId}`, {
    method: "DELETE",
  });
}

export function reordenarGrupos(usuarioId: number, ordem: number[]) {
  return request<GrupoResponseDTO[]>(`/usuarios/${usuarioId}/grupos/reordenar`, {
    method: "PATCH",
    body: JSON.stringify({ ordem }),
  });
}

export function reordenarLinksDoGrupo(usuarioId: number, grupoId: number, ordem: number[]) {
  return request<LinkResponseDTO[]>(`/usuarios/${usuarioId}/grupos/${grupoId}/links/reordenar`, {
    method: "PATCH",
    body: JSON.stringify({ ordem }),
  });
}

export function buscarPaginaPublica(username: string) {
  return request<PaginaPublicaDTO>(`/p/${username}`);
}

export function buscarMeuPerfil() {
  return request<UsuarioResponseDTO>("/usuarios/me");
}

export function curtirPet(username: string) {
  return request<PetCurtidaResponseDTO>(`/p/${username}/pet/like`, {
    method: "POST",
    headers: { "X-Visitor-Id": obterVisitorId() },
  });
}

export function customizarPet(
  usuarioId: number,
  dados: { cor: string; chapeu: string; rosto: string; acessorioCorpo: string }
) {
  return request<PetResponseDTO>(`/usuarios/${usuarioId}/pet`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function atualizarTema(usuarioId: number, tema: string, corPersonalizada?: string) {
  return request<UsuarioResponseDTO>(`/usuarios/${usuarioId}/tema`, {
    method: "PATCH",
    body: JSON.stringify({ tema, corPersonalizada }),
  });
}

export function atualizarTagsPerfil(usuarioId: number, tags: string[]) {
  return request<UsuarioResponseDTO>(`/usuarios/${usuarioId}/tags-perfil`, {
    method: "PATCH",
    body: JSON.stringify({ tags }),
  });
}

export function registrarClique(username: string, linkId: number) {
  return request<void>(`/p/${username}/links/${linkId}/click`, {
    method: "POST",
  });
}

export function atualizarBio(usuarioId: number, bio: string) {
  return request<UsuarioResponseDTO>(`/usuarios/${usuarioId}/bio`, {
    method: "PATCH",
    body: JSON.stringify({ bio }),
  });
}

export function atualizarCaptarContato(usuarioId: number, ativo: boolean) {
  return request<UsuarioResponseDTO>(`/usuarios/${usuarioId}/captar-contato`, {
    method: "PATCH",
    body: JSON.stringify({ ativo }),
  });
}

export function capturarContato(username: string, dados: { email?: string; whatsapp?: string }) {
  return request<void>(`/p/${username}/contato`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function listarContatos(usuarioId: number) {
  return request<ContatoCapturadoResponseDTO[]>(`/usuarios/${usuarioId}/contatos`);
}

export function excluirContato(usuarioId: number, contatoId: number) {
  return request<void>(`/usuarios/${usuarioId}/contatos/${contatoId}`, {
    method: "DELETE",
  });
}

export function uploadFoto(usuarioId: number, arquivo: File) {
  const formData = new FormData();
  formData.append("arquivo", arquivo);

  return request<UsuarioResponseDTO>(`/usuarios/${usuarioId}/pfp`, {
    method: "POST",
    body: formData,
  });
}

export function historicoCliques(usuarioId: number, linkId: number, dias = 7) {
  return request<LinkCliqueDiaDTO[]>(
    `/usuarios/${usuarioId}/links/${linkId}/cliques/historico?dias=${dias}`
  );
}

export interface EstatisticaItemDTO {
  rotulo: string;
  quantidade: number;
}

export interface EstatisticasPerfilDTO {
  total: number;
  origens: EstatisticaItemDTO[];
  dispositivos: EstatisticaItemDTO[];
  paises: EstatisticaItemDTO[];
}

export function obterEstatisticas(usuarioId: number, dias = 30) {
  return request<EstatisticasPerfilDTO>(`/usuarios/${usuarioId}/analytics?dias=${dias}`);
}

// Imagens enviadas via upload são servidas pelo próprio backend em
// caminhos relativos (/uploads/...); URLs externas coladas pelo usuário
// (ex: pictureLink de um link) já vêm absolutas e não devem ser alteradas.
export function urlImagem(caminho: string | null): string | null {
  if (!caminho) return null;
  return caminho.startsWith("/uploads/") ? `${API_URL}${caminho}` : caminho;
}
