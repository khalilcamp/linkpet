"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registrarClique, urlImagem, obterToken, buscarMeuPerfil, PaginaPublicaDTO, LinkResponseDTO } from "@/lib/api";
import { classesDoTema, TemaClasses } from "@/lib/temas";
import { fontFamilyDaFonte, classeFormatoBotao, classeEstiloBotao } from "@/lib/aparencia";
import { detectarEmbed } from "@/lib/embeds";
import PetCard from "@/components/PetCard";
import PetSvg from "@/components/PetSvg";
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
  layout = "linha",
}: {
  link: LinkResponseDTO;
  username: string;
  tema: TemaClasses;
  formatoBotao: string;
  estiloBotao: string;
  layout?: "linha" | "quadrado";
}) {
  const quadrado = layout === "quadrado";

  if (link.tipoConteudo === "texto") {
    const conteudo = (
      <div
        className={`${quadrado ? "flex h-full flex-col justify-center overflow-hidden px-3 py-2" : "space-y-1 px-4 py-3"} border text-left transition ${tema.card} ${classeFormatoBotao(formatoBotao)}`}
        style={tema.estiloCard}
      >
        <p className={`font-medium ${tema.texto} ${quadrado ? "text-sm" : ""}`}>{link.label}</p>
        {link.conteudo && (
          <p className={`whitespace-pre-wrap text-sm ${tema.subtexto} ${quadrado ? "line-clamp-4 text-xs" : ""}`}>
            {link.conteudo}
          </p>
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
        className={`block text-inherit no-underline ${tema.cardHover} ${quadrado ? "h-full" : ""}`}
      >
        {conteudo}
      </a>
    );
  }

  if (link.tipoConteudo === "imagem") {
    const conteudo = (
      <div
        className={`${quadrado ? "flex h-full flex-col" : ""} overflow-hidden border transition ${tema.card} ${classeFormatoBotao(formatoBotao)}`}
        style={tema.estiloCard}
      >
        {link.pictureLink && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.pictureLink}
            alt={link.label}
            className={quadrado ? "min-h-0 flex-1 w-full object-cover" : "w-full object-cover"}
          />
        )}
        {link.conteudo && (
          <p className={`shrink-0 px-3 py-1.5 text-left text-sm ${tema.subtexto} ${quadrado ? "truncate text-xs" : "px-4 py-2"}`}>
            {link.conteudo}
          </p>
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
        className={`block ${tema.cardHover} ${quadrado ? "h-full" : ""}`}
      >
        {conteudo}
      </a>
    );
  }

  const embed = link.exibirComoEmbed ? detectarEmbed(link.url ?? "", link.embedCompacto) : null;

  if (embed?.tipo === "instagram") {
    // O widget do Instagram impõe uma largura mínima própria (~326px) que
    // nenhum CSS nosso derruba — dentro de uma célula quadrada estreita
    // (linha de destaques com mais de um item) ele fica com scroll interno
    // mesmo, sem solução de layout de verdade além de não colocar posts do
    // Instagram lado a lado com outros destaques.
    return (
      <div
        className={`flex justify-center overflow-y-auto rounded-xl ${quadrado ? "h-full" : ""}`}
        style={quadrado ? undefined : { maxHeight: 380 }}
      >
        <InstagramEmbedBlock permalink={embed.permalink} />
      </div>
    );
  }

  if (embed?.tipo === "iframe") {
    return (
      <div
        className={`overflow-hidden border ${quadrado ? "h-full" : ""} ${tema.card} ${classeFormatoBotao(formatoBotao)}`}
        style={tema.estiloCard}
      >
        <iframe
          src={embed.embedUrl}
          width="100%"
          height={quadrado ? "100%" : embed.altura}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; fullscreen"
          style={{ display: "block", border: "none" }}
        />
      </div>
    );
  }

  const urlDoLink = link.url ?? "";

  if (quadrado) {
    return (
      <a
        href={urlDoLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          registrarClique(username, link.linkId).catch(() => {});
        }}
        className={`flex h-full flex-col items-center justify-center gap-2 border p-3 text-center transition ${tema.card} ${tema.cardHover} ${classeFormatoBotao(formatoBotao)} ${classeEstiloBotao(estiloBotao)}`}
        style={tema.estiloCard}
      >
        {link.pictureLink ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.pictureLink} alt="" className="h-8 w-8 shrink-0 rounded" />
        ) : (
          <IconeSocial url={urlDoLink} className="h-8 w-8 shrink-0" />
        )}
        <span className={`line-clamp-2 text-xs font-medium ${tema.texto}`}>{link.label}</span>
      </a>
    );
  }

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

// Tentáculo decorativo do tema Octacore — ícone "Curled Tentacle" de Lorc
// (game-icons.net, CC BY 3.0 — crédito ao autor obrigatório, ver README).
// Espiral com ventosas, bem mais limpo do que tentar desenhar um traço à mão.
function TentaculoOctacore({ cor, className }: { cor: string; className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill={cor} className={className}>
      <path d="M309.822 19.695c-91.36.614-193.674 54.694-233.935 133.168-58.023 113.09-28.643 221.764 35.04 336.393l190.57-.002a32.73 32.73 0 0 0 2.222.02c.142-.002.28-.015.423-.02h53.826c-10.486-3.502-20.882-7.894-31.085-13.047 10.072-16.983 2.354-44.398-23.168-43.71-10.64.29-18.18 5.295-22.633 12.222-9.458-8.397-18.286-17.478-26.467-27.068 14.902-15.993 8.335-49.138-19.69-48.38-4.657.125-8.716 1.157-12.187 2.855a296.492 296.492 0 0 1-15.035-30.328c19.106-14.293 13.695-52.217-16.244-51.435a238.492 238.492 0 0 1-3.124-18.773 219.15 219.15 0 0 1-1.234-13.135c27.28-5.747 28.78-46.347 4.5-54.635 2.133-8.412 4.962-16.413 8.507-23.892l.038-.08c3.723 2.18 8.316 3.415 13.788 3.267 24.495-.642 31.46-28.02 20.904-43.215a203.652 203.652 0 0 1 13.332-9.234 89.57 89.57 0 0 1 4.932-2.897c2.136 11.04 10.508 20.495 25.126 20.1 19.36-.506 27.768-17.725 25.23-32.423 10.7-.52 20.69.4 29.788 2.475-3.264 13.06 3.77 28.85 21.106 28.38 7.844-.205 13.576-3.63 17.203-8.513a61.384 61.384 0 0 1 3.927 4.208c5.093 6.01 8.785 12.684 10.91 19.893-16.187 5.228-16.828 29.973-1.92 35.932-3.047 8.154-7.957 16.63-15.078 25.203-2.402-2.767-6.02-4.564-10.86-4.433-13.943.38-17.764 16.166-11.48 24.613-7.052 4.543-13.68 7.366-19.712 8.86.646-5.998-2.903-12.428-10.666-12.22-7.328.2-10.9 6.108-10.737 11.784-.245-.09-.493-.178-.733-.273-3.894-2.125-7.526-5.38-10.77-10.09 10-2.95 10.16-18.5.458-21.31 1.414-3.197 3.41-6.582 6.097-10.094 2.516 1.67 6.553 2.795 12.133 2.72 12.562-.16 17.35-6.17 14.387-10.68.03.004.058.005.088.007-.056-.047-.113-.09-.168-.137-.805-1.158-2.132-2.21-3.975-3.03-9.49-6.445-20.606-8.778-30.73-7.298l-.29-.275c-.12.126-.23.253-.35.38-20.527 3.34-36.708 22.448-26.394 54.75 38.275 119.87 242.354 18.336 199.733-111.55-26.183-79.795-79.363-114.193-151.262-115.053v.01c-1.444-.017-2.892-.02-4.342-.012zm10.998 54.41c14.242.315 19.363 14.59 15.375 25.27-8.943-1.925-18.474-2.888-28.455-2.764-1.802.024-3.62.087-5.45.18-1.875-10.222 3.933-22.308 17.437-22.68.37-.01.734-.012 1.093-.005zm-89.662 19.678c10.26.227 15.777 7.702 16.578 15.856-10.812 4.692-20.504 10.55-29.088 17.374-11.32-9.146-7.527-32.72 11.416-33.227.37-.01.735-.012 1.094-.004zM399.52 117.52c20.92.463 22.177 31.056 3.753 36.11-2.97-8.64-7.556-16.664-13.53-23.714a81.96 81.96 0 0 0-5.206-5.584c2.952-3.906 7.578-6.64 13.89-6.81.37-.01.734-.01 1.093-.002zm-220.913 47.916c2.688.06 5.046.62 7.084 1.556-.853 1.626-1.68 3.27-2.467 4.932-4.48 9.448-7.923 19.466-10.397 29.908-18.905-3.996-17.358-35.804 4.688-36.394.37-.01.734-.01 1.093-.002zm224.227 36.566c17.194 5.42 15.09 35.413-6.303 35.97-5.064.137-9.04-1.437-11.94-4 8.517-10.48 14.57-21.238 18.244-31.97zM164.51 255.506c.713.016 1.403.067 2.078.14.545.32 1.106.618 1.685.897.292 5.745.794 11.534 1.518 17.355.948 7.61 2.286 15.275 3.946 22.957-.64.555-1.246 1.14-1.824 1.75-2.54 1.096-5.447 1.763-8.738 1.848-28.972.78-28.968-44.158-.002-44.943.452-.012.9-.014 1.338-.004zm193.303 2.953c3.933 8.724-.404 21.676-13.012 22.007-7.69.208-12.293-4.443-13.83-10.127 8.665-2.06 17.738-5.972 26.842-11.88zm-170.31 88.552c.675.062 1.36.11 2.06.13a312.01 312.01 0 0 0 19.998 39.79c-.043.115-.084.23-.126.347-3.702 3.412-8.744 5.656-15.157 5.822-27.942.752-30.193-39.013-6.773-46.09zm49.524 78.914c11.59 14.01 24.498 27.076 38.655 38.8-4.436 7.024-12.017 12.112-22.752 12.39-29.78.806-35.312-36.62-16.627-51.134.243-.016.484-.035.724-.056z" />
    </svg>
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

  // Se quem está vendo a página está logado como o próprio dono dela, troca
  // o CTA de "crie a sua" por um atalho direto pro dashboard — só dispara a
  // checagem quando há token salvo, pra não gastar uma chamada à toa em toda
  // visita anônima (a esmagadora maioria).
  const [souODono, setSouODono] = useState(false);

  useEffect(() => {
    if (!dados || !obterToken()) return;
    let cancelado = false;
    buscarMeuPerfil()
      .then((perfil) => {
        if (!cancelado && perfil.userName === dados.userName) setSouODono(true);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [dados]);

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
      className={`relative min-h-screen overflow-hidden px-4 py-16 ${tema.fundo}`}
      style={{ ...tema.estiloFundo, fontFamily: fontFamilyDaFonte(dados.fonte) }}
    >
      {dados.tema === "octacore" && (
        <>
          <TentaculoOctacore
            cor="#dc2626"
            className="pointer-events-none absolute -bottom-6 -left-10 h-48 w-48 opacity-60"
          />
          <TentaculoOctacore
            cor="#14b8a6"
            className="pointer-events-none absolute -top-6 -right-10 h-48 w-48 rotate-180 opacity-60"
          />
        </>
      )}
      <div className="relative mx-auto max-w-sm space-y-8 text-center">
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
          linksDestaque.length === 1 ? (
            <div className="space-y-3">
              <LinkCard
                link={linksDestaque[0]}
                username={username}
                tema={tema}
                formatoBotao={dados.formatoBotao}
                estiloBotao={dados.estiloBotao}
              />
            </div>
          ) : (
            // Os cards têm tamanho fixo (não encolhem pra caber) — numa tela
            // larga o suficiente eles cabem lado a lado sem rolar; numa tela
            // de celular estreita, a fileira rola horizontalmente em vez de
            // espremer cada card. O -translate-x-1/2 + left-1/2 + w-screen é
            // o truque de "sair" da largura estreita (max-w-sm) do resto da
            // página só nessa seção.
            <div className="relative left-1/2 w-screen -translate-x-1/2">
              <div className="mx-auto flex max-w-xl justify-center gap-3 overflow-x-auto px-4 pb-1">
                {linksDestaque.map((link) => (
                  <div key={link.linkId} className="h-40 w-40 shrink-0 overflow-hidden">
                    <LinkCard
                      link={link}
                      username={username}
                      tema={tema}
                      formatoBotao={dados.formatoBotao}
                      estiloBotao={dados.estiloBotao}
                      layout="quadrado"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
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

        <Link
          href={souODono ? "/dashboard" : "/cadastro"}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${tema.card} ${tema.cardHover} ${tema.texto}`}
          style={tema.estiloCard}
        >
          <PetSvg cor="laranja" estagioVisual={1} className="h-4 w-4" />
          {souODono ? t("footer.editCta") : t("footer.cta")}
        </Link>
      </div>
    </main>
  );
}
