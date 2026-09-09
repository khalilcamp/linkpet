// Decodificação simples de JWT no client, só para ler o "subject" (username).
// Não faz validação de assinatura -- isso é responsabilidade exclusiva do backend.
// Serve apenas para saber "quem está logado" no frontend.

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export function decodificarUsernameDoToken(token: string): string | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload: JwtPayload = JSON.parse(payloadJson);
    return payload.sub;
  } catch {
    return null;
  }
}

export function tokenExpirado(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload: JwtPayload = JSON.parse(payloadJson);
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
