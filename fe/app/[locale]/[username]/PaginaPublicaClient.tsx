"use client";

import { useTranslations } from "next-intl";
import { registrarClique, urlImagem, PaginaPublicaDTO } from "@/lib/api";
import { classesDoTema } from "@/lib/temas";
import PetCard from "@/components/PetCard";
import IconeSocial from "@/components/IconeSocial";
import Badges from "@/components/Badges";

export default function PaginaPublicaClient({
  username,
  dadosIniciais,
}: {
  username: string;
  dadosIniciais: PaginaPublicaDTO | null;
}) {
  const t = useTranslations("paginaPublica");
  const dados = dadosIniciais;
  const tema = classesDoTema(dados?.tema);

  if (!dados) {
    return (
      <main className={`flex min-h-screen items-center justify-center ${tema.fundo}`}>
        <p className={tema.subtexto}>{t("notFound")}</p>
      </main>
    );
  }

  const linksAtivos = dados.links
    .filter((l) => l.ativo)
    .sort((a, b) => a.position - b.position);

  return (
    <main className={`min-h-screen px-4 py-16 ${tema.fundo}`}>
      <div className="mx-auto max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          {dados.userPfp ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlImagem(dados.userPfp) ?? undefined}
              alt={dados.userName}
              className="mx-auto h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800 text-2xl text-neutral-400">
              {dados.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className={`text-lg font-semibold ${tema.texto}`}>
            @{dados.userName}
          </h1>
          {dados.badges && <Badges codigos={dados.badges} />}
          {dados.bio && (
            <p className={`text-sm ${tema.subtexto}`}>{dados.bio}</p>
          )}
        </div>

        {dados.pet && (
          <PetCard
            username={username}
            pet={dados.pet}
            cardClassName={tema.card}
            subtextoClassName={tema.subtexto}
          />
        )}

        <div className="space-y-3">
          {linksAtivos.length === 0 && (
            <p className={`text-sm ${tema.subtexto}`}>
              {t("noLinksYet")}
            </p>
          )}

          {linksAtivos.map((link) => (
            <a
              key={link.linkId}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                registrarClique(username, link.linkId).catch(() => {
                  // Falha ao registrar clique não deve impedir a navegação.
                });
              }}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${tema.card} ${tema.cardHover}`}
            >
              {link.pictureLink ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={link.pictureLink}
                  alt=""
                  className="h-6 w-6 rounded"
                />
              ) : (
                <IconeSocial url={link.url} />
              )}
              <span className={`flex-1 font-medium ${tema.texto}`}>
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
