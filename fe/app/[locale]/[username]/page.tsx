import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buscarPaginaPublica, PaginaPublicaDTO } from "@/lib/api";
import PaginaPublicaClient from "./PaginaPublicaClient";

type Params = { locale: string; username: string };

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
  const { locale, username } = await params;
  const dados = await buscarDadosOuNulo(username);
  const t = await getTranslations({ locale, namespace: "paginaPublica" });

  if (!dados) {
    return { title: t("notFoundTitle") };
  }

  const titulo = `${dados.userName} | LinkPet`;
  const descricao = t("description", { username: dados.userName });

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
