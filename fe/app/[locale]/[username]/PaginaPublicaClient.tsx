"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { registrarClique, urlImagem, PaginaPublicaDTO, LinkResponseDTO } from "@/lib/api";
import { classesDoTema, TemaClasses } from "@/lib/temas";
import { fontFamilyDaFonte, classeFormatoBotao, classeEstiloBotao } from "@/lib/aparencia";
import { detectarEmbed } from "@/lib/embeds";
import PetCard from "@/components/PetCard";
import IconeSocial from "@/components/IconeSocial";
import Badges from "@/components/Badges";
import PerfilTags from "@/components/PerfilTags";
import CapturarContatoForm from "@/components/CapturarContatoForm";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const INSTAGRAM_SCRIPT_SRC = "https://www.instagram.com/embed.js";

// O widget oficial do Instagram transforma o <blockquote> abaixo num
// iframe. O script só precisa ser carregado uma vez por página — se já
// estiver presente, só reprocessa os blockquotes novos.
function InstagramEmbedBlock({ permalink }: { permalink: string }) {
  const ref = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    function processar() {
      window.instgrm?.Embeds.process();
    }

    if (window.instgrm) {
      processar();
      return;
    }

    const existente = document.querySelector<HTMLScriptElement>(`script[src="${INSTAGRAM_SCRIPT_SRC}"]`);
    if (existente) {
      existente.addEventListener("load", processar);
      return () => existente.removeEventListener("load", processar);
    }

    const script = document.createElement("script");
    script.src = INSTAGRAM_SCRIPT_SRC;
    script.async = true;
    script.onload = processar;
    document.body.appendChild(script);
  }, [permalink]);

  return (
    <blockquote
      ref={ref}
      className="instagram-media"
      data-instgrm-permalink={permalink}
      data-instgrm-version="14"
      style={{ margin: "0 auto", width: "100%" }}
    />
  );
}

function LinkCard({
  link,
  username,
  tema,
  formatoBotao,
  estiloBotao,
}: {
  link: LinkResponseDTO;
  username: string;
  tema: TemaClasses;
  formatoBotao: string;
  estiloBotao: string;
}) {
  if (link.tipoConteudo === "texto") {
    const conteudo = (
      <div
        className={`space-y-1 border px-4 py-3 text-left transition ${tema.card} ${classeFormatoBotao(formatoBotao)}`}
        style={tema.estiloCard}
      >
        <p className={`font-medium ${tema.texto}`}>{link.label}</p>
        {link.conteudo && <p className={`whitespace-pre-wrap text-sm ${tema.subtexto}`}>{link.conteudo}</p>}
      </div>
    );

    if (!link.url) return conteudo;

    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          registrarClique(username, link.linkId).catch(() => {});
        }}
        className={`block text-inherit no-underline ${tema.cardHover}`}
      >
        {conteudo}
      </a>
    );
  }

  if (link.tipoConteudo === "imagem") {
    const conteudo = (
      <div
        className={`overflow-hidden border transition ${tema.card} ${classeFormatoBotao(formatoBotao)}`}
        style={tema.estiloCard}
      >
        {link.pictureLink && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.pictureLink} alt={link.label} className="w-full object-cover" />
        )}
        {link.conteudo && (
          <p className={`px-4 py-2 text-left text-sm ${tema.subtexto}`}>{link.conteudo}</p>
        )}
      </div>
    );

    if (!link.url) return conteudo;

    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          registrarClique(username, link.linkId).catch(() => {});
        }}
        className={`block ${tema.cardHover}`}
      >
        {conteudo}
      </a>
    );
  }

  const embed = link.exibirComoEmbed ? detectarEmbed(link.url ?? "", link.embedCompacto) : null;

  if (embed?.tipo === "instagram") {
    // O card do Instagram já vem com moldura própria do widget deles —
    // não aplicamos o border/fundo do tema por cima, só centralizamos.
    return (
      <div className="flex justify-center overflow-y-auto rounded-xl" style={{ maxHeight: 380 }}>
        <InstagramEmbedBlock permalink={embed.permalink} />
      </div>
    );
  }

  if (embed?.tipo === "iframe") {
    return (
      <div
        className={`overflow-hidden border ${tema.card} ${classeFormatoBotao(formatoBotao)}`}
        style={tema.estiloCard}
      >
        <iframe
          src={embed.embedUrl}
          width="100%"
          height={embed.altura}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; fullscreen"
          style={{ display: "block", border: "none" }}
        />
      </div>
    );
  }

  const urlDoLink = link.url ?? "";

  return (
    <a
      href={urlDoLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        registrarClique(username, link.linkId).catch(() => {
          // Falha ao registrar clique não deve impedir a navegação.
        });
      }}
      className={`flex items-center gap-3 border px-4 py-3 transition ${tema.card} ${tema.cardHover} ${classeFormatoBotao(formatoBotao)} ${classeEstiloBotao(estiloBotao)}`}
      style={tema.estiloCard}
    >
      {link.pictureLink ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.pictureLink} alt="" className="h-6 w-6 rounded" />
      ) : (
        <IconeSocial url={urlDoLink} />
      )}
      <span className={`flex-1 font-medium ${tema.texto}`}>{link.label}</span>
    </a>
  );
}

// Célula do layout "grid": só o ícone (customizado ou o favicon detectado
// da URL), sem rótulo visível — o nome do link vira aria-label/title.
function LinkGridItem({
  link,
  username,
  tema,
  formatoBotao,
}: {
  link: LinkResponseDTO;
  username: string;
  tema: TemaClasses;
  formatoBotao: string;
}) {
  const urlDoLink = link.url ?? "";

  return (
    <a
      href={urlDoLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      title={link.label}
      onClick={() => {
        registrarClique(username, link.linkId).catch(() => {
          // Falha ao registrar clique não deve impedir a navegação.
        });
      }}
      className={`flex aspect-square items-center justify-center border transition ${tema.card} ${tema.cardHover} ${classeFormatoBotao(formatoBotao)}`}
      style={tema.estiloCard}
    >
      {link.pictureLink ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.pictureLink} alt="" className="h-7 w-7 rounded" />
      ) : (
        <IconeSocial url={urlDoLink} className="h-7 w-7" />
      )}
    </a>
  );
}

export default function PaginaPublicaClient({
  username,
  dadosIniciais,
}: {
  username: string;
  dadosIniciais: PaginaPublicaDTO | null;
}) {
  const t = useTranslations("paginaPublica");
  const dados = dadosIniciais;
  const tema = classesDoTema(dados?.tema, dados?.corPersonalizada);

  if (!dados) {
    return (
      <main className={`flex min-h-screen items-center justify-center ${tema.fundo}`}>
        <p className={tema.subtexto}>{t("notFound")}</p>
      </main>
    );
  }

  const linksSemGrupo = [...dados.linksSemGrupo].sort((a, b) => a.position - b.position);
  const grupos = dados.grupos.map((grupo) => ({
    ...grupo,
    links: [...grupo.links].sort((a, b) => a.position - b.position),
  }));
  const linksDestaque = [...(dados.linksDestaque ?? [])].sort(
    (a, b) => (a.destaquePosicao ?? 0) - (b.destaquePosicao ?? 0)
  );
  const semNenhumLink = linksSemGrupo.length === 0 && grupos.length === 0 && linksDestaque.length === 0;

  return (
    <main
      className={`min-h-screen px-4 py-16 ${tema.fundo}`}
      style={{ ...tema.estiloFundo, fontFamily: fontFamilyDaFonte(dados.fonte) }}
    >
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
          {dados.tags && <PerfilTags codigos={dados.tags} />}
          {dados.bio && (
            <p className={`text-sm ${tema.subtexto}`}>{dados.bio}</p>
          )}
        </div>

        {linksDestaque.length > 0 && (
          <div className={linksDestaque.length > 1 ? "flex items-start gap-3" : "space-y-3"}>
            {linksDestaque.map((link) => (
              <div key={link.linkId} className={linksDestaque.length > 1 ? "min-w-0 flex-1" : undefined}>
                <LinkCard
                  link={link}
                  username={username}
                  tema={tema}
                  formatoBotao={dados.formatoBotao}
                  estiloBotao={dados.estiloBotao}
                />
              </div>
            ))}
          </div>
        )}

        {dados.pet && (
          <PetCard
            username={username}
            pet={dados.pet}
            cardClassName={tema.card}
            cardStyle={tema.estiloCard}
            subtextoClassName={tema.subtexto}
          />
        )}

        <div className="space-y-6">
          {semNenhumLink && (
            <p className={`text-sm ${tema.subtexto}`}>
              {t("noLinksYet")}
            </p>
          )}

          {linksSemGrupo.length > 0 && (
            <div className="space-y-3">
              {linksSemGrupo.map((link) => (
                <LinkCard
                  key={link.linkId}
                  link={link}
                  username={username}
                  tema={tema}
                  formatoBotao={dados.formatoBotao}
                  estiloBotao={dados.estiloBotao}
                />
              ))}
            </div>
          )}

          {grupos.map((grupo, indice) => (
            <div key={indice} className="space-y-3">
              <h2 className={`text-left text-xs font-semibold uppercase tracking-wide ${tema.subtexto}`}>
                {grupo.nome}
              </h2>
              {grupo.layout === "grid" ? (
                <div className="grid grid-cols-4 gap-3">
                  {grupo.links.map((link) => (
                    <LinkGridItem
                      key={link.linkId}
                      link={link}
                      username={username}
                      tema={tema}
                      formatoBotao={dados.formatoBotao}
                    />
                  ))}
                </div>
              ) : (
                grupo.links.map((link) => (
                  <LinkCard
                    key={link.linkId}
                    link={link}
                    username={username}
                    tema={tema}
                    formatoBotao={dados.formatoBotao}
                    estiloBotao={dados.estiloBotao}
                  />
                ))
              )}
            </div>
          ))}
        </div>

        {dados.captarContato && (
          <CapturarContatoForm username={username} tema={tema} formatoBotao={dados.formatoBotao} />
        )}
      </div>
    </main>
  );
}
