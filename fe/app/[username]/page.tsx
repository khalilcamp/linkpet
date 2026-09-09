import type { Metadata } from "next";
import { buscarPaginaPublica, PaginaPublicaDTO } from "@/lib/api";
import PaginaPublicaClient from "./PaginaPublicaClient";

type Params = { username: string };

async function buscarDadosOuNulo(username: string): Promise<PaginaPublicaDTO | null> {
  try {
    return await buscarPaginaPublica(username);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  const dados = await buscarDadosOuNulo(username);

  if (!dados) {
    return { title: "Perfil não encontrado | LinkPet" };
  }

  const titulo = `${dados.userName} | LinkPet`;
  const descricao = `Confira os links de @${dados.userName}`;

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      images: dados.userPfp ? [dados.userPfp] : [],
    },
    twitter: {
      card: "summary",
      title: titulo,
      description: descricao,
      images: dados.userPfp ? [dados.userPfp] : [],
    },
  };
}

export default async function PaginaPublica({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  // Mesma chamada de generateMetadata: o Next memoiza fetches idênticos
  // dentro da mesma requisição, então isso não dispara uma segunda
  // visualização no backend.
  const dadosIniciais = await buscarDadosOuNulo(username);

  return <PaginaPublicaClient username={username} dadosIniciais={dadosIniciais} />;
}
