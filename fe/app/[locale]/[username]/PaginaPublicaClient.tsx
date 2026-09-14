"use client";

import { useTranslations } from "next-intl";
import { registrarClique, urlImagem, PaginaPublicaDTO, LinkResponseDTO } from "@/lib/api";
import { classesDoTema, TemaClasses } from "@/lib/temas";
import { fontFamilyDaFonte, classeFormatoBotao, classeEstiloBotao } from "@/lib/aparencia";
import PetCard from "@/components/PetCard";
import IconeSocial from "@/components/IconeSocial";
import Badges from "@/components/Badges";
import PerfilTags from "@/components/PerfilTags";
import CapturarContatoForm from "@/components/CapturarContatoForm";

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
  return (
    <a
      href={link.url}
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
        <IconeSocial url={link.url} />
      )}
      <span className={`flex-1 font-medium ${tema.texto}`}>{link.label}</span>
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
  const semNenhumLink = linksSemGrupo.length === 0 && grupos.length === 0;

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
              {grupo.links.map((link) => (
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
          ))}
        </div>

        {dados.captarContato && (
          <CapturarContatoForm username={username} tema={tema} formatoBotao={dados.formatoBotao} />
        )}
      </div>
    </main>
  );
}
