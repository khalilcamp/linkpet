"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obterToken, removerToken, buscarMeuPerfil, UsuarioResponseDTO } from "./api";
import { tokenExpirado } from "./jwt";

// Hook para páginas protegidas: confere se existe token válido, e se sim,
// busca os dados do usuário logado (incluindo o id, necessário para chamar
// /usuarios/{id}/links) através do endpoint GET /usuarios/me.
export function useAuth() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<UsuarioResponseDTO | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const token = obterToken();

    if (!token || tokenExpirado(token)) {
      removerToken();
      router.push("/login");
      return;
    }

    buscarMeuPerfil()
      .then((dados) => {
        setUsuario(dados);
        setCarregando(false);
      })
      .catch(() => {
        setErro("Não foi possível carregar seu perfil.");
        setCarregando(false);
      });
  }, [router]);

  return { usuario, carregando, erro };
}
