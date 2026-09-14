"use client";

import { useEffect, useState, FormEvent, ChangeEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/useAuth";
import {
  criarLink,
  listarLinks,
  atualizarLink,
  removerLink,
  reativarLink,
  reordenarLinks,
  moverLink,
  listarGrupos,
  criarGrupo,
  renomearGrupo,
  alternarGrupoAtivo,
  atualizarLayoutGrupo,
  uploadImagemLink,
  reordenarDestaque,
  excluirGrupo,
  reordenarGrupos,
  reordenarLinksDoGrupo,
  removerToken,
  buscarPaginaPublica,
  customizarPet,
  atualizarTema,
  atualizarAparencia,
  atualizarBio,
  atualizarTagsPerfil,
  uploadFoto,
  historicoCliques,
  urlImagem,
  reenviarConfirmacaoEmail,
  atualizarCaptarContato,
  listarContatos,
  excluirContato,
  LinkResponseDTO,
  LinkCliqueDiaDTO,
  PetResponseDTO,
  GrupoResponseDTO,
  ContatoCapturadoResponseDTO,
} from "@/lib/api";
import PetSvg, {
  CORES,
  CORES_DISPONIVEIS,
  CHAPEUS_DISPONIVEIS,
  ROSTOS_DISPONIVEIS,
  ACESSORIOS_CORPO_DISPONIVEIS,
} from "@/components/PetSvg";
import GraficoCliques from "@/components/GraficoCliques";
import EstatisticasPerfil from "@/components/EstatisticasPerfil";
import { TEMAS_DISPONIVEIS } from "@/lib/temas";
import {
  FONTES_DISPONIVEIS,
  FORMATOS_BOTAO_DISPONIVEIS,
  ESTILOS_BOTAO_DISPONIVEIS,
  fontFamilyDaFonte,
  classeFormatoBotao,
} from "@/lib/aparencia";
import { TAGS_DISPONIVEIS, TAGS_MAXIMO } from "@/lib/perfilTags";
import { detectarEmbed } from "@/lib/embeds";
import QRCode from "qrcode";

const ABAS = ["links", "personalizar", "contatos", "compartilhar"] as const;

// "texto" e "imagem" são exclusivos Premium+ — o backend recusa a criação
// se o usuário não tiver o plano, então aqui não pré-filtramos as opções
// (o erro do servidor já explica isso quando a pessoa tenta salvar).
const TIPOS_CONTEUDO_DISPONIVEIS = ["link", "texto", "imagem"] as const;

// Itens de customização exclusivos de badge: só aparecem na lista pra quem
// já tem a badge correspondente, pra não mostrar algo que o usuário não pode
// escolher (evita FOMO por um item que ele nem sabe como conseguir).
const CHAPEUS_EXCLUSIVOS: Record<string, string> = {
  capacete_skyrim: "skyrim_rp",
};

type Aba = (typeof ABAS)[number];

function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function IconeGrafico() {
  return (
    <Icone>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </Icone>
  );
}

function IconeEditar() {
  return (
    <Icone>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icone>
  );
}

function IconeExcluir() {
  return (
    <Icone>
      <path d="M4 7h16" />
      <path d="M6 7V4h12v3M9 11v6M15 11v6" />
      <path d="M6 7l1 13h10l1-13" />
    </Icone>
  );
}

function IconeChevronUp() {
  return (
    <Icone>
      <path d="m6 15 6-6 6 6" />
    </Icone>
  );
}

function IconeChevronDown() {
  return (
    <Icone>
      <path d="m6 9 6 6 6-6" />
    </Icone>
  );
}

function LinkRow({
  link,
  index,
  lista,
  onMover,
  onAlternarHistorico,
  historicoAbertoId,
  carregandoHistorico,
  historicoDados,
  onIniciarEdicao,
  onExcluir,
  excluindoId,
  onReativar,
  hojeISO,
  grupos,
  onMoverParaGrupo,
  t,
}: {
  link: LinkResponseDTO;
  index: number;
  lista: LinkResponseDTO[];
  onMover: (lista: LinkResponseDTO[], index: number, direcao: -1 | 1) => void;
  onAlternarHistorico: (linkId: number) => void;
  historicoAbertoId: number | null;
  carregandoHistorico: boolean;
  historicoDados: LinkCliqueDiaDTO[] | null;
  onIniciarEdicao: (link: LinkResponseDTO) => void;
  onExcluir: (linkId: number) => void;
  excluindoId: number | null;
  onReativar: (linkId: number) => void;
  hojeISO: string;
  grupos: GrupoResponseDTO[];
  onMoverParaGrupo: (linkId: number, grupoId: number | null) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 py-4">
        {link.pictureLink && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.pictureLink} alt="" className="h-8 w-8 shrink-0 rounded" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium text-white">{link.label}</p>
            {link.exibirComoEmbed && (
              <span className="shrink-0 rounded-full bg-purple-950 px-2 py-0.5 text-xs text-purple-400">
                {link.embedCompacto ? t("links.embedCompactBadge") : t("links.embedBadge")}
              </span>
            )}
            {link.destaque && (
              <span className="shrink-0 rounded-full bg-amber-950 px-2 py-0.5 text-xs text-amber-400">
                {t("links.destaqueBadge")}
              </span>
            )}
            {(link.tipoConteudo === "texto" || link.tipoConteudo === "imagem") && (
              <span className="shrink-0 rounded-full bg-sky-950 px-2 py-0.5 text-xs text-sky-400">
                {t(`links.tipoConteudo.${link.tipoConteudo}`)}
              </span>
            )}
            {!link.ativo && (
              <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                {t("links.inactive")}
              </span>
            )}
            {link.ativo && link.dataInicio && link.dataInicio > hojeISO && (
              <span className="shrink-0 rounded-full bg-blue-950 px-2 py-0.5 text-xs text-blue-400">
                {t("links.scheduled")}
              </span>
            )}
            {link.ativo && link.dataFim && link.dataFim < hojeISO && (
              <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                {t("links.expired")}
              </span>
            )}
          </div>
          <p className="truncate text-sm text-neutral-500">{link.url}</p>
          <p className="text-xs text-neutral-600">{t("links.clicks", { count: link.cliques })}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-neutral-500">
          <select
            value={link.grupoId ?? ""}
            onChange={(e) => onMoverParaGrupo(link.linkId, e.target.value ? Number(e.target.value) : null)}
            aria-label={t("links.groups.moveToGroup")}
            title={t("links.groups.moveToGroup")}
            className="rounded-md border border-neutral-800 bg-neutral-950 px-1.5 py-1 text-xs text-neutral-400 outline-none focus:border-orange-500"
          >
            <option value="">{t("links.groups.noGroup")}</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </option>
            ))}
          </select>
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onMover(lista, index, -1)}
              disabled={index === 0}
              aria-label={t("links.moveUp")}
              className="rounded p-0.5 hover:text-white disabled:opacity-30"
            >
              <IconeChevronUp />
            </button>
            <button
              type="button"
              onClick={() => onMover(lista, index, 1)}
              disabled={index === lista.length - 1}
              aria-label={t("links.moveDown")}
              className="rounded p-0.5 hover:text-white disabled:opacity-30"
            >
              <IconeChevronDown />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onAlternarHistorico(link.linkId)}
            aria-label={t("links.viewHistory")}
            title={t("links.historyTitle")}
            className={`rounded-md p-2 transition hover:bg-neutral-800 hover:text-white ${
              historicoAbertoId === link.linkId ? "bg-orange-500/10 text-orange-400" : ""
            }`}
          >
            <IconeGrafico />
          </button>
          <button
            type="button"
            onClick={() => onIniciarEdicao(link)}
            aria-label={t("links.editLink")}
            title={t("links.edit")}
            className="rounded-md p-2 transition hover:bg-neutral-800 hover:text-white"
          >
            <IconeEditar />
          </button>
          {link.ativo ? (
            <button
              type="button"
              onClick={() => onExcluir(link.linkId)}
              disabled={excluindoId === link.linkId}
              aria-label={t("links.deleteLink")}
              title={t("links.delete")}
              className="rounded-md p-2 transition hover:bg-red-950 hover:text-red-400 disabled:opacity-50"
            >
              <IconeExcluir />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onReativar(link.linkId)}
              className="rounded-md px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-neutral-800"
            >
              {t("links.reactivate")}
            </button>
          )}
        </div>
      </div>

      {historicoAbertoId === link.linkId && (
        <div className="pb-4">
          {carregandoHistorico && <p className="text-xs text-neutral-500">{t("links.loadingHistory")}</p>}
          {!carregandoHistorico && historicoDados && <GraficoCliques dados={historicoDados} />}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tTags = useTranslations("perfilTags");
  const router = useRouter();
  const { usuario, carregando, erro: erroAuth } = useAuth();

  const chapeusVisiveis = CHAPEUS_DISPONIVEIS.filter((opcao) => {
    const badgeNecessaria = CHAPEUS_EXCLUSIVOS[opcao];
    return !badgeNecessaria || usuario?.badges?.includes(badgeNecessaria);
  });

  const [aba, setAba] = useState<Aba>("links");
  const [confirmacaoEnviada, setConfirmacaoEnviada] = useState(false);
  const [enviandoConfirmacao, setEnviandoConfirmacao] = useState(false);

  const [links, setLinks] = useState<LinkResponseDTO[]>([]);
  const [carregandoLinks, setCarregandoLinks] = useState(true);
  const [mostrarNovoLink, setMostrarNovoLink] = useState(false);

  const [grupos, setGrupos] = useState<GrupoResponseDTO[]>([]);
  const [criandoGrupo, setCriandoGrupo] = useState(false);
  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [salvandoGrupo, setSalvandoGrupo] = useState(false);
  const [erroGrupo, setErroGrupo] = useState<string | null>(null);
  const [editandoGrupoId, setEditandoGrupoId] = useState<number | null>(null);
  const [editGrupoNome, setEditGrupoNome] = useState("");

  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [pictureLink, setPictureLink] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [exibirComoEmbed, setExibirComoEmbed] = useState(false);
  const [embedCompacto, setEmbedCompacto] = useState(false);
  const [destaque, setDestaque] = useState(false);
  const [tipoConteudo, setTipoConteudo] = useState("link");
  const [conteudo, setConteudo] = useState("");
  const [enviandoImagemBloco, setEnviandoImagemBloco] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editPictureLink, setEditPictureLink] = useState("");
  const [editDataInicio, setEditDataInicio] = useState("");
  const [editDataFim, setEditDataFim] = useState("");
  const [editExibirComoEmbed, setEditExibirComoEmbed] = useState(false);
  const [editEmbedCompacto, setEditEmbedCompacto] = useState(false);
  const [editDestaque, setEditDestaque] = useState(false);
  const [editTipoConteudo, setEditTipoConteudo] = useState("link");
  const [editConteudo, setEditConteudo] = useState("");
  const [enviandoImagemBlocoEdicao, setEnviandoImagemBlocoEdicao] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const [historicoAbertoId, setHistoricoAbertoId] = useState<number | null>(null);
  const [historicoDados, setHistoricoDados] = useState<LinkCliqueDiaDTO[] | null>(null);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [pet, setPet] = useState<PetResponseDTO | null>(null);
  const [cor, setCor] = useState("");
  const [chapeu, setChapeu] = useState("nenhum");
  const [rosto, setRosto] = useState("nenhum");
  const [acessorioCorpo, setAcessorioCorpo] = useState("nenhum");
  const [salvandoPet, setSalvandoPet] = useState(false);
  const [erroPet, setErroPet] = useState<string | null>(null);

  const [temaOverride, setTemaOverride] = useState<string | null>(null);
  const [corPersonalizadaOverride, setCorPersonalizadaOverride] = useState<string | null>(null);
  const [salvandoTema, setSalvandoTema] = useState(false);
  const [erroTema, setErroTema] = useState<string | null>(null);
  const tema = temaOverride ?? usuario?.tema ?? "escuro";
  const corPersonalizada = corPersonalizadaOverride ?? usuario?.corPersonalizada ?? "#f97316";

  const [fonteOverride, setFonteOverride] = useState<string | null>(null);
  const [formatoBotaoOverride, setFormatoBotaoOverride] = useState<string | null>(null);
  const [estiloBotaoOverride, setEstiloBotaoOverride] = useState<string | null>(null);
  const [salvandoAparencia, setSalvandoAparencia] = useState(false);
  const [erroAparencia, setErroAparencia] = useState<string | null>(null);
  const fonte = fonteOverride ?? usuario?.fonte ?? "padrao";
  const formatoBotao = formatoBotaoOverride ?? usuario?.formatoBotao ?? "arredondado";
  const estiloBotao = estiloBotaoOverride ?? usuario?.estiloBotao ?? "preenchido";

  const [bioOverride, setBioOverride] = useState<string | null>(null);
  const [salvandoBio, setSalvandoBio] = useState(false);
  const [erroBio, setErroBio] = useState<string | null>(null);
  const bioValor = bioOverride ?? usuario?.bio ?? "";

  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([]);
  const [salvandoTags, setSalvandoTags] = useState(false);
  const [erroTags, setErroTags] = useState<string | null>(null);

  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [fotoOverride, setFotoOverride] = useState<string | null>(null);
  const fotoAtual = fotoOverride ?? usuario?.userPfp ?? null;

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [gerandoQr, setGerandoQr] = useState(false);

  const [captarContatoOverride, setCaptarContatoOverride] = useState<boolean | null>(null);
  const captarContatoAtivo = captarContatoOverride ?? usuario?.captarContato ?? false;
  const [salvandoCaptarContato, setSalvandoCaptarContato] = useState(false);
  const [erroCaptarContato, setErroCaptarContato] = useState<string | null>(null);
  const [contatos, setContatos] = useState<ContatoCapturadoResponseDTO[]>([]);
  const [carregandoContatos, setCarregandoContatos] = useState(true);
  const [excluindoContatoId, setExcluindoContatoId] = useState<number | null>(null);

  useEffect(() => {
    if (!usuario) return;

    listarLinks(usuario.id)
      .then((dadosLinks) => {
        setLinks(dadosLinks);
        // Conta nova, sem nenhum link: já deixa o formulário aberto pra
        // não exigir um clique extra na primeira vez.
        if (dadosLinks.length === 0) {
          setMostrarNovoLink(true);
        }
      })
      .catch(() => setErroForm(t("links.genericLoadError")))
      .finally(() => setCarregandoLinks(false));

    listarGrupos(usuario.id)
      .then(setGrupos)
      .catch(() => setErroGrupo(t("links.groups.genericLoadError")));

    listarContatos(usuario.id)
      .then(setContatos)
      .catch(() => setErroCaptarContato(t("contatos.genericLoadError")))
      .finally(() => setCarregandoContatos(false));

    buscarPaginaPublica(usuario.userName)
      .then((dados) => {
        setPet(dados.pet);
        setCor(dados.pet.cor);
        setChapeu(dados.pet.chapeu);
        setRosto(dados.pet.rosto);
        setAcessorioCorpo(dados.pet.acessorioCorpo);
      })
      .catch(() => setErroPet(t("customize.genericPetError")));
  }, [usuario]);

  useEffect(() => {
    if (usuario) setTagsSelecionadas(usuario.tags ?? []);
  }, [usuario]);

  const petSemAlteracoes =
    !!pet &&
    cor === pet.cor &&
    chapeu === pet.chapeu &&
    rosto === pet.rosto &&
    acessorioCorpo === pet.acessorioCorpo;

  async function handleSalvarPet(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    setErroPet(null);
    setSalvandoPet(true);

    try {
      const petAtualizado = await customizarPet(usuario.id, { cor, chapeu, rosto, acessorioCorpo });
      setPet(petAtualizado);
    } catch (err) {
      setErroPet(err instanceof Error ? err.message : t("customize.genericPetSaveError"));
    } finally {
      setSalvandoPet(false);
    }
  }

  async function handleSalvarTema(novoTema: string, cor?: string) {
    if (!usuario) return;

    setErroTema(null);
    setSalvandoTema(true);

    try {
      const atualizado = await atualizarTema(usuario.id, novoTema, cor);
      setTemaOverride(atualizado.tema);
      setCorPersonalizadaOverride(atualizado.corPersonalizada);
    } catch (err) {
      setErroTema(err instanceof Error ? err.message : t("customize.genericThemeError"));
    } finally {
      setSalvandoTema(false);
    }
  }

  async function handleSalvarAparencia(mudancas: { fonte?: string; formatoBotao?: string; estiloBotao?: string }) {
    if (!usuario) return;

    setErroAparencia(null);
    setSalvandoAparencia(true);

    try {
      const atualizado = await atualizarAparencia(usuario.id, {
        fonte: mudancas.fonte ?? fonte,
        formatoBotao: mudancas.formatoBotao ?? formatoBotao,
        estiloBotao: mudancas.estiloBotao ?? estiloBotao,
      });
      setFonteOverride(atualizado.fonte);
      setFormatoBotaoOverride(atualizado.formatoBotao);
      setEstiloBotaoOverride(atualizado.estiloBotao);
    } catch (err) {
      setErroAparencia(err instanceof Error ? err.message : t("customize.genericAparenciaError"));
    } finally {
      setSalvandoAparencia(false);
    }
  }

  function alternarTag(codigo: string) {
    setTagsSelecionadas((atual) =>
      atual.includes(codigo)
        ? atual.filter((t) => t !== codigo)
        : atual.length >= TAGS_MAXIMO
        ? atual
        : [...atual, codigo]
    );
  }

  async function handleSalvarTags(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    setErroTags(null);
    setSalvandoTags(true);

    try {
      const atualizado = await atualizarTagsPerfil(usuario.id, tagsSelecionadas);
      setTagsSelecionadas(atualizado.tags ?? []);
    } catch (err) {
      setErroTags(err instanceof Error ? err.message : t("customize.genericTagsError"));
    } finally {
      setSalvandoTags(false);
    }
  }

  async function handleSalvarBio(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    setErroBio(null);
    setSalvandoBio(true);

    try {
      const atualizado = await atualizarBio(usuario.id, bioValor);
      setBioOverride(atualizado.bio ?? "");
    } catch (err) {
      setErroBio(err instanceof Error ? err.message : t("customize.genericBioError"));
    } finally {
      setSalvandoBio(false);
    }
  }

  async function handleEnviarFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo || !usuario) return;

    setErroFoto(null);
    setEnviandoFoto(true);

    try {
      const atualizado = await uploadFoto(usuario.id, arquivo);
      setFotoOverride(atualizado.userPfp);
    } catch (err) {
      setErroFoto(err instanceof Error ? err.message : t("genericPhotoError"));
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function handleEnviarImagemBloco(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo || !usuario) return;

    setErroForm(null);
    setEnviandoImagemBloco(true);

    try {
      const { url } = await uploadImagemLink(usuario.id, arquivo);
      setPictureLink(url);
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("genericPhotoError"));
    } finally {
      setEnviandoImagemBloco(false);
    }
  }

  async function handleEnviarImagemBlocoEdicao(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo || !usuario) return;

    setErroEdicao(null);
    setEnviandoImagemBlocoEdicao(true);

    try {
      const { url } = await uploadImagemLink(usuario.id, arquivo);
      setEditPictureLink(url);
    } catch (err) {
      setErroEdicao(err instanceof Error ? err.message : t("genericPhotoError"));
    } finally {
      setEnviandoImagemBlocoEdicao(false);
    }
  }

  async function handleMostrarQrCode() {
    if (!usuario) return;
    if (qrCodeUrl) {
      setQrCodeUrl(null);
      return;
    }

    setGerandoQr(true);
    try {
      const urlPerfil = `${window.location.origin}/${usuario.userName}`;
      const dataUrl = await QRCode.toDataURL(urlPerfil, { margin: 1, width: 240 });
      setQrCodeUrl(dataUrl);
    } finally {
      setGerandoQr(false);
    }
  }

  async function handleAlternarHistorico(linkId: number) {
    if (!usuario) return;

    if (historicoAbertoId === linkId) {
      setHistoricoAbertoId(null);
      setHistoricoDados(null);
      return;
    }

    setHistoricoAbertoId(linkId);
    setHistoricoDados(null);
    setCarregandoHistorico(true);

    try {
      const dados = await historicoCliques(usuario.id, linkId, 7);
      setHistoricoDados(dados);
    } catch {
      setHistoricoDados([]);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  async function handleCriarLink(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    setErroForm(null);
    setSalvando(true);

    try {
      const novoLink = await criarLink(usuario.id, {
        url: url || undefined,
        label,
        pictureLink: pictureLink || undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        exibirComoEmbed,
        embedCompacto,
        destaque,
        tipoConteudo,
        conteudo: conteudo || undefined,
      });
      setLinks((atual) => [...atual, novoLink]);
      setUrl("");
      setLabel("");
      setPictureLink("");
      setDataInicio("");
      setDataFim("");
      setExibirComoEmbed(false);
      setEmbedCompacto(false);
      setDestaque(false);
      setTipoConteudo("link");
      setConteudo("");
      setMostrarNovoLink(false);
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("links.genericCreateError"));
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(link: LinkResponseDTO) {
    setEditandoId(link.linkId);
    setEditUrl(link.url || "");
    setEditLabel(link.label);
    setEditPictureLink(link.pictureLink || "");
    setEditDataInicio(link.dataInicio || "");
    setEditDataFim(link.dataFim || "");
    setEditExibirComoEmbed(link.exibirComoEmbed);
    setEditEmbedCompacto(link.embedCompacto);
    setEditDestaque(link.destaque);
    setEditTipoConteudo(link.tipoConteudo || "link");
    setEditConteudo(link.conteudo || "");
    setErroEdicao(null);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setErroEdicao(null);
  }

  async function handleSalvarEdicao(e: FormEvent, linkId: number) {
    e.preventDefault();
    if (!usuario) return;

    setErroEdicao(null);
    setSalvandoEdicao(true);

    try {
      const linkAtualizado = await atualizarLink(usuario.id, linkId, {
        url: editUrl || undefined,
        label: editLabel,
        pictureLink: editPictureLink || undefined,
        dataInicio: editDataInicio || undefined,
        dataFim: editDataFim || undefined,
        exibirComoEmbed: editExibirComoEmbed,
        embedCompacto: editEmbedCompacto,
        destaque: editDestaque,
        tipoConteudo: editTipoConteudo,
        conteudo: editConteudo || undefined,
      });
      setLinks((atual) =>
        atual.map((l) => (l.linkId === linkId ? linkAtualizado : l))
      );
      setEditandoId(null);
    } catch (err) {
      setErroEdicao(err instanceof Error ? err.message : t("links.genericEditError"));
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function handleExcluirLink(linkId: number) {
    if (!usuario) return;
    if (!window.confirm(t("links.confirmDelete"))) {
      return;
    }

    setExcluindoId(linkId);

    try {
      await removerLink(usuario.id, linkId);
      setLinks((atual) =>
        atual.map((l) => (l.linkId === linkId ? { ...l, ativo: false } : l))
      );
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("links.genericDeleteError"));
    } finally {
      setExcluindoId(null);
    }
  }

  async function handleReativarLink(linkId: number) {
    if (!usuario) return;

    try {
      const linkAtualizado = await reativarLink(usuario.id, linkId);
      setLinks((atual) =>
        atual.map((l) => (l.linkId === linkId ? linkAtualizado : l))
      );
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("links.genericReactivateError"));
    }
  }

  async function handleMoverDestaque(destaquesOrdenados: LinkResponseDTO[], index: number, direcao: -1 | 1) {
    if (!usuario) return;
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= destaquesOrdenados.length) return;

    const novaOrdem = [...destaquesOrdenados];
    [novaOrdem[index], novaOrdem[alvo]] = [novaOrdem[alvo], novaOrdem[index]];

    try {
      const atualizados = await reordenarDestaque(usuario.id, novaOrdem.map((l) => l.linkId));
      setLinks(atualizados);
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("links.genericReorderError"));
    }
  }

  async function handleMoverLink(linksOrdenados: LinkResponseDTO[], index: number, direcao: -1 | 1) {
    if (!usuario) return;
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= linksOrdenados.length) return;

    const novaOrdem = [...linksOrdenados];
    [novaOrdem[index], novaOrdem[alvo]] = [novaOrdem[alvo], novaOrdem[index]];

    try {
      const atualizados = await reordenarLinks(usuario.id, novaOrdem.map((l) => l.linkId));
      setLinks(atualizados);
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("links.genericReorderError"));
    }
  }

  async function handleMoverLinkDentroGrupo(
    linksDoGrupoOrdenados: LinkResponseDTO[],
    index: number,
    direcao: -1 | 1,
    grupoId: number
  ) {
    if (!usuario) return;
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= linksDoGrupoOrdenados.length) return;

    const novaOrdem = [...linksDoGrupoOrdenados];
    [novaOrdem[index], novaOrdem[alvo]] = [novaOrdem[alvo], novaOrdem[index]];

    try {
      const atualizados = await reordenarLinksDoGrupo(usuario.id, grupoId, novaOrdem.map((l) => l.linkId));
      setLinks(atualizados);
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("links.genericReorderError"));
    }
  }

  async function handleMoverLinkParaGrupo(linkId: number, grupoId: number | null) {
    if (!usuario) return;

    try {
      const atualizado = await moverLink(usuario.id, linkId, grupoId);
      setLinks((atual) => atual.map((l) => (l.linkId === linkId ? atualizado : l)));
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("links.genericReorderError"));
    }
  }

  async function handleCriarGrupo(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    setErroGrupo(null);
    setSalvandoGrupo(true);

    try {
      const novoGrupo = await criarGrupo(usuario.id, novoGrupoNome);
      setGrupos((atual) => [...atual, novoGrupo]);
      setNovoGrupoNome("");
      setCriandoGrupo(false);
    } catch (err) {
      setErroGrupo(err instanceof Error ? err.message : t("links.groups.genericCreateError"));
    } finally {
      setSalvandoGrupo(false);
    }
  }

  function iniciarEdicaoGrupo(grupo: GrupoResponseDTO) {
    setEditandoGrupoId(grupo.id);
    setEditGrupoNome(grupo.nome);
    setErroGrupo(null);
  }

  function cancelarEdicaoGrupo() {
    setEditandoGrupoId(null);
    setErroGrupo(null);
  }

  async function handleSalvarEdicaoGrupo(e: FormEvent, grupoId: number) {
    e.preventDefault();
    if (!usuario) return;

    setErroGrupo(null);
    setSalvandoGrupo(true);

    try {
      const atualizado = await renomearGrupo(usuario.id, grupoId, editGrupoNome);
      setGrupos((atual) => atual.map((g) => (g.id === grupoId ? atualizado : g)));
      setEditandoGrupoId(null);
    } catch (err) {
      setErroGrupo(err instanceof Error ? err.message : t("links.groups.genericEditError"));
    } finally {
      setSalvandoGrupo(false);
    }
  }

  async function handleAlternarGrupoAtivo(grupoId: number, ativoAtual: boolean) {
    if (!usuario) return;

    try {
      const atualizado = await alternarGrupoAtivo(usuario.id, grupoId, !ativoAtual);
      setGrupos((atual) => atual.map((g) => (g.id === grupoId ? atualizado : g)));
    } catch (err) {
      setErroGrupo(err instanceof Error ? err.message : t("links.groups.genericEditError"));
    }
  }

  async function handleAlternarLayoutGrupo(grupoId: number, layoutAtual: string) {
    if (!usuario) return;

    const novoLayout = layoutAtual === "grid" ? "lista" : "grid";
    try {
      const atualizado = await atualizarLayoutGrupo(usuario.id, grupoId, novoLayout);
      setGrupos((atual) => atual.map((g) => (g.id === grupoId ? atualizado : g)));
      setErroGrupo(null);
    } catch (err) {
      setErroGrupo(err instanceof Error ? err.message : t("links.groups.genericEditError"));
    }
  }

  async function handleExcluirGrupo(grupoId: number) {
    if (!usuario) return;
    if (!window.confirm(t("links.groups.confirmDelete"))) return;

    try {
      await excluirGrupo(usuario.id, grupoId);
      setGrupos((atual) => atual.filter((g) => g.id !== grupoId));
      // Os links do grupo voltam a ficar soltos, com posições novas —
      // mais simples buscar de novo do que recalcular isso no cliente.
      const atualizados = await listarLinks(usuario.id);
      setLinks(atualizados);
    } catch (err) {
      setErroGrupo(err instanceof Error ? err.message : t("links.groups.genericDeleteError"));
    }
  }

  async function handleMoverGrupo(gruposOrdenados: GrupoResponseDTO[], index: number, direcao: -1 | 1) {
    if (!usuario) return;
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= gruposOrdenados.length) return;

    const novaOrdem = [...gruposOrdenados];
    [novaOrdem[index], novaOrdem[alvo]] = [novaOrdem[alvo], novaOrdem[index]];

    try {
      const atualizados = await reordenarGrupos(usuario.id, novaOrdem.map((g) => g.id));
      setGrupos(atualizados);
    } catch (err) {
      setErroGrupo(err instanceof Error ? err.message : t("links.groups.genericReorderError"));
    }
  }

  async function handleAlternarCaptarContato() {
    if (!usuario) return;

    setErroCaptarContato(null);
    setSalvandoCaptarContato(true);

    try {
      const atualizado = await atualizarCaptarContato(usuario.id, !captarContatoAtivo);
      setCaptarContatoOverride(atualizado.captarContato);
    } catch (err) {
      setErroCaptarContato(err instanceof Error ? err.message : t("contatos.genericToggleError"));
    } finally {
      setSalvandoCaptarContato(false);
    }
  }

  async function handleExcluirContato(contatoId: number) {
    if (!usuario) return;
    if (!window.confirm(t("contatos.confirmDelete"))) return;

    setExcluindoContatoId(contatoId);
    try {
      await excluirContato(usuario.id, contatoId);
      setContatos((atual) => atual.filter((c) => c.id !== contatoId));
    } catch (err) {
      setErroCaptarContato(err instanceof Error ? err.message : t("contatos.genericDeleteError"));
    } finally {
      setExcluindoContatoId(null);
    }
  }

  function handleLogout() {
    removerToken();
    router.push("/login");
  }

  async function handleReenviarConfirmacao() {
    if (!usuario) return;
    setEnviandoConfirmacao(true);
    try {
      await reenviarConfirmacaoEmail(usuario.userEmail);
      setConfirmacaoEnviada(true);
    } finally {
      setEnviandoConfirmacao(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="text-neutral-400">{t("loading")}</p>
      </main>
    );
  }

  if (erroAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md space-y-3 text-center">
          <p className="text-red-400">{erroAuth}</p>
          <p className="text-sm text-neutral-500">
            {t("authErrorHint")}
          </p>
        </div>
      </main>
    );
  }

  if (!usuario) return null;

  const hojeISO = new Date().toISOString().slice(0, 10);
  const linksSoltos = links.filter((l) => l.grupoId == null).sort((a, b) => a.position - b.position);
  const linksDestaqueOrdenados = links
    .filter((l) => l.destaque)
    .sort((a, b) => (a.destaquePosicao ?? 0) - (b.destaquePosicao ?? 0));
  const gruposOrdenados = [...grupos].sort((a, b) => a.posicao - b.posicao);
  const linksDoGrupo = (grupoId: number) =>
    links.filter((l) => l.grupoId === grupoId).sort((a, b) => a.position - b.position);

  function renderLinkOuEdicao(lista: LinkResponseDTO[], grupoId?: number) {
    const onMover = grupoId
      ? (l: LinkResponseDTO[], i: number, d: -1 | 1) => handleMoverLinkDentroGrupo(l, i, d, grupoId)
      : handleMoverLink;

    return lista.map((link, index) =>
      editandoId === link.linkId ? (
        <form
          key={link.linkId}
          onSubmit={(e) => handleSalvarEdicao(e, link.linkId)}
          className="space-y-2 rounded-xl border border-neutral-700 bg-neutral-900 p-4"
        >
          <div className="flex gap-2">
            {TIPOS_CONTEUDO_DISPONIVEIS.map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setEditTipoConteudo(tipo)}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  editTipoConteudo === tipo
                    ? "border-orange-500 text-orange-400"
                    : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                {t(`links.tipoConteudo.${tipo}`)}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            placeholder={t("links.editTitlePlaceholder")}
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
          />

          {editTipoConteudo !== "texto" && (
            <input
              type="url"
              required={editTipoConteudo === "link"}
              placeholder={editTipoConteudo === "link" ? t("links.urlPlaceholder") : t("links.urlOpcionalPlaceholder")}
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
            />
          )}

          {editTipoConteudo === "imagem" ? (
            <div className="space-y-1.5">
              <input
                type="url"
                required
                placeholder={t("links.imagemUrlPlaceholder")}
                value={editPictureLink}
                onChange={(e) => setEditPictureLink(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
              />
              <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleEnviarImagemBlocoEdicao}
                  disabled={enviandoImagemBlocoEdicao}
                  className="hidden"
                />
                <span className="underline">{t("links.uploadImagemBloco")}</span>
                {enviandoImagemBlocoEdicao && <span>{t("uploadingPhoto")}</span>}
              </label>
            </div>
          ) : editTipoConteudo === "link" ? (
            <input
              type="url"
              placeholder={t("links.iconUrlPlaceholder")}
              value={editPictureLink}
              onChange={(e) => setEditPictureLink(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
            />
          ) : null}

          {(editTipoConteudo === "texto" || editTipoConteudo === "imagem") && (
            <textarea
              required={editTipoConteudo === "texto"}
              rows={3}
              maxLength={1000}
              placeholder={
                editTipoConteudo === "texto" ? t("links.conteudoTextoPlaceholder") : t("links.conteudoLegendaPlaceholder")
              }
              value={editConteudo}
              onChange={(e) => setEditConteudo(e.target.value)}
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
            />
          )}

          <div className="flex gap-3">
            <label className="flex-1 text-xs text-neutral-500">
              {t("links.startsAt")}
              <input
                type="date"
                value={editDataInicio}
                onChange={(e) => setEditDataInicio(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
            </label>
            <label className="flex-1 text-xs text-neutral-500">
              {t("links.endsAt")}
              <input
                type="date"
                value={editDataFim}
                onChange={(e) => setEditDataFim(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
            </label>
          </div>

          {editTipoConteudo === "link" && (
            <label className="flex items-start gap-2 text-sm text-neutral-400">
              <input
                type="checkbox"
                checked={editExibirComoEmbed}
                onChange={(e) => setEditExibirComoEmbed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-950 accent-orange-500"
              />
              <span>
                {t("links.embedToggle")}
                <span className="block text-xs text-neutral-600">{t("links.embedHint")}</span>
              </span>
            </label>
          )}

          {editTipoConteudo === "link" && editExibirComoEmbed && detectarEmbed(editUrl)?.tipo === "iframe" && (
            <label className="ml-6 flex items-start gap-2 text-sm text-neutral-400">
              <input
                type="checkbox"
                checked={editEmbedCompacto}
                onChange={(e) => setEditEmbedCompacto(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-950 accent-orange-500"
              />
              <span>
                {t("links.embedCompactToggle")}
                <span className="block text-xs text-neutral-600">{t("links.embedCompactHint")}</span>
              </span>
            </label>
          )}

          <label className="flex items-start gap-2 text-sm text-neutral-400">
            <input
              type="checkbox"
              checked={editDestaque}
              onChange={(e) => setEditDestaque(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-950 accent-orange-500"
            />
            <span>
              {t("links.destaqueToggle")}
              <span className="block text-xs text-neutral-600">{t("links.destaqueHint")}</span>
            </span>
          </label>

          {erroEdicao && (
            <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
              {erroEdicao}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={salvandoEdicao}
              className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
            >
              {salvandoEdicao ? t("links.saving") : t("links.save")}
            </button>
            <button
              type="button"
              onClick={cancelarEdicao}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              {t("links.cancel")}
            </button>
          </div>
        </form>
      ) : (
        <LinkRow
          key={link.linkId}
          link={link}
          index={index}
          lista={lista}
          onMover={onMover}
          onAlternarHistorico={handleAlternarHistorico}
          historicoAbertoId={historicoAbertoId}
          carregandoHistorico={carregandoHistorico}
          historicoDados={historicoDados}
          onIniciarEdicao={iniciarEdicao}
          onExcluir={handleExcluirLink}
          excluindoId={excluindoId}
          onReativar={handleReativarLink}
          hojeISO={hojeISO}
          grupos={gruposOrdenados}
          onMoverParaGrupo={handleMoverLinkParaGrupo}
          t={t}
        />
      )
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 pb-16 text-white">
      <div className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <PetSvg cor="laranja" estagioVisual={1} className="h-6 w-6" />
            LinkPet
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900"
          >
            {t("logout")}
          </button>
        </div>
      </div>

      {!usuario.emailVerificado && (
        <div className="border-b border-orange-900/40 bg-orange-950/30">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
            <p className="text-orange-300">
              {t("emailBanner.message")}
            </p>
            {confirmacaoEnviada ? (
              <p className="text-orange-400">{t("emailBanner.sent")}</p>
            ) : (
              <button
                onClick={handleReenviarConfirmacao}
                disabled={enviandoConfirmacao}
                className="font-medium text-orange-300 underline hover:text-orange-200 disabled:opacity-50"
              >
                {enviandoConfirmacao ? t("emailBanner.resendLoading") : t("emailBanner.resend")}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-start gap-4">
          <label className="relative cursor-pointer">
            {fotoAtual ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlImagem(fotoAtual) ?? undefined}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-lg text-orange-400">
                {usuario.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleEnviarFoto}
              disabled={enviandoFoto}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
          <div>
            <h1 className="font-display text-2xl font-semibold">
              {t("greeting", { name: usuario.userName })}
            </h1>
            <a
              href={`/${usuario.userName}`}
              target="_blank"
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              {t("viewPublicPage")}
            </a>
            <p className="mt-1 text-xs text-neutral-500">
              {t("profileViews", { count: usuario.perfilVisualizacoes })}
            </p>
            {enviandoFoto && <p className="text-xs text-neutral-500">{t("uploadingPhoto")}</p>}
            {erroFoto && <p className="text-xs text-red-400">{erroFoto}</p>}
          </div>
        </div>

        <div className="mt-8 flex gap-1 border-b border-neutral-900">
          {ABAS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setAba(id)}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                aba === id
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {t(`tabs.${id}`)}
            </button>
          ))}
        </div>

        {aba === "links" && (
          <div className="mt-6 space-y-6">
            {linksDestaqueOrdenados.length > 1 && (
              <section className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-4">
                <h2 className="mb-1 text-sm font-medium text-amber-400">{t("links.destaqueOrdemTitulo")}</h2>
                <p className="mb-3 text-xs text-neutral-500">{t("links.destaqueOrdemHint")}</p>
                <ul className="space-y-1.5">
                  {linksDestaqueOrdenados.map((link, index) => (
                    <li
                      key={link.linkId}
                      className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2"
                    >
                      <span className="flex-1 truncate text-sm text-white">{link.label}</span>
                      <button
                        type="button"
                        onClick={() => handleMoverDestaque(linksDestaqueOrdenados, index, -1)}
                        disabled={index === 0}
                        aria-label={t("links.moveUp")}
                        className="rounded p-0.5 text-neutral-500 hover:text-white disabled:opacity-30"
                      >
                        <IconeChevronUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoverDestaque(linksDestaqueOrdenados, index, 1)}
                        disabled={index === linksDestaqueOrdenados.length - 1}
                        aria-label={t("links.moveDown")}
                        className="rounded p-0.5 text-neutral-500 hover:text-white disabled:opacity-30"
                      >
                        <IconeChevronDown />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!mostrarNovoLink ? (
              <button
                type="button"
                onClick={() => setMostrarNovoLink(true)}
                className="w-full rounded-xl border border-dashed border-neutral-800 py-3 text-sm font-medium text-neutral-400 transition hover:border-neutral-700 hover:text-white"
              >
                {t("links.newLink")}
              </button>
            ) : (
              <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-medium text-white">{t("links.addLink")}</h2>
                  <button
                    type="button"
                    onClick={() => setMostrarNovoLink(false)}
                    className="text-sm text-neutral-500 hover:text-white"
                  >
                    {t("links.cancel")}
                  </button>
                </div>
                <form onSubmit={handleCriarLink} className="space-y-3">
                  <div className="flex gap-2">
                    {TIPOS_CONTEUDO_DISPONIVEIS.map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setTipoConteudo(tipo)}
                        className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          tipoConteudo === tipo
                            ? "border-orange-500 text-orange-400"
                            : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        {t(`links.tipoConteudo.${tipo}`)}
                      </button>
                    ))}
                  </div>
                  {tipoConteudo !== "link" && (
                    <p className="text-xs text-neutral-600">{t("links.tipoConteudoHint")}</p>
                  )}

                  <input
                    type="text"
                    required
                    placeholder={t("links.titlePlaceholder")}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                  />

                  {tipoConteudo !== "texto" && (
                    <input
                      type="url"
                      required={tipoConteudo === "link"}
                      placeholder={tipoConteudo === "link" ? t("links.urlPlaceholder") : t("links.urlOpcionalPlaceholder")}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                    />
                  )}

                  {tipoConteudo === "imagem" ? (
                    <div className="space-y-1.5">
                      <input
                        type="url"
                        required
                        placeholder={t("links.imagemUrlPlaceholder")}
                        value={pictureLink}
                        onChange={(e) => setPictureLink(e.target.value)}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                      />
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleEnviarImagemBloco}
                          disabled={enviandoImagemBloco}
                          className="hidden"
                        />
                        <span className="underline">{t("links.uploadImagemBloco")}</span>
                        {enviandoImagemBloco && <span>{t("uploadingPhoto")}</span>}
                      </label>
                    </div>
                  ) : tipoConteudo === "link" ? (
                    <input
                      type="url"
                      placeholder={t("links.iconUrlPlaceholder")}
                      value={pictureLink}
                      onChange={(e) => setPictureLink(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                    />
                  ) : null}

                  {(tipoConteudo === "texto" || tipoConteudo === "imagem") && (
                    <textarea
                      required={tipoConteudo === "texto"}
                      rows={3}
                      maxLength={1000}
                      placeholder={
                        tipoConteudo === "texto" ? t("links.conteudoTextoPlaceholder") : t("links.conteudoLegendaPlaceholder")
                      }
                      value={conteudo}
                      onChange={(e) => setConteudo(e.target.value)}
                      className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                    />
                  )}

                  <div className="flex gap-3">
                    <label className="flex-1 text-xs text-neutral-500">
                      {t("links.startsAt")}
                      <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      />
                    </label>
                    <label className="flex-1 text-xs text-neutral-500">
                      {t("links.endsAt")}
                      <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      />
                    </label>
                  </div>

                  {tipoConteudo === "link" && (
                    <label className="flex items-start gap-2 text-sm text-neutral-400">
                      <input
                        type="checkbox"
                        checked={exibirComoEmbed}
                        onChange={(e) => setExibirComoEmbed(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-950 accent-orange-500"
                      />
                      <span>
                        {t("links.embedToggle")}
                        <span className="block text-xs text-neutral-600">{t("links.embedHint")}</span>
                      </span>
                    </label>
                  )}

                  {tipoConteudo === "link" && exibirComoEmbed && detectarEmbed(url)?.tipo === "iframe" && (
                    <label className="ml-6 flex items-start gap-2 text-sm text-neutral-400">
                      <input
                        type="checkbox"
                        checked={embedCompacto}
                        onChange={(e) => setEmbedCompacto(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-950 accent-orange-500"
                      />
                      <span>
                        {t("links.embedCompactToggle")}
                        <span className="block text-xs text-neutral-600">{t("links.embedCompactHint")}</span>
                      </span>
                    </label>
                  )}

                  <label className="flex items-start gap-2 text-sm text-neutral-400">
                    <input
                      type="checkbox"
                      checked={destaque}
                      onChange={(e) => setDestaque(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-950 accent-orange-500"
                    />
                    <span>
                      {t("links.destaqueToggle")}
                      <span className="block text-xs text-neutral-600">{t("links.destaqueHint")}</span>
                    </span>
                  </label>

                  {erroForm && (
                    <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                      {erroForm}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={salvando}
                    className="w-full rounded-lg bg-orange-500 py-2 font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
                  >
                    {salvando ? t("links.addLoading") : t("links.addLink")}
                  </button>
                </form>
              </section>
            )}

            {carregandoLinks && (
              <p className="text-sm text-neutral-500">{t("links.loadingLinks")}</p>
            )}

            {!carregandoLinks && links.length === 0 && !mostrarNovoLink && (
              <p className="text-sm text-neutral-500">
                {t("links.noLinks")}
              </p>
            )}

            <section className="divide-y divide-neutral-900">
              {renderLinkOuEdicao(linksSoltos)}
            </section>

            <section className="space-y-3">
              {gruposOrdenados.map((grupo, indiceGrupo) => (
                <div key={grupo.id} className="rounded-xl border border-neutral-800 bg-neutral-950/40">
                  {editandoGrupoId === grupo.id ? (
                    <form
                      onSubmit={(e) => handleSalvarEdicaoGrupo(e, grupo.id)}
                      className="flex items-center gap-2 p-3"
                    >
                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={editGrupoNome}
                        onChange={(e) => setEditGrupoNome(e.target.value)}
                        className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white outline-none focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        disabled={salvandoGrupo}
                        className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
                      >
                        {t("links.save")}
                      </button>
                      <button
                        type="button"
                        onClick={cancelarEdicaoGrupo}
                        className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
                      >
                        {t("links.cancel")}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2 p-3">
                      <div className="flex flex-col text-neutral-500">
                        <button
                          type="button"
                          onClick={() => handleMoverGrupo(gruposOrdenados, indiceGrupo, -1)}
                          disabled={indiceGrupo === 0}
                          aria-label={t("links.moveUp")}
                          className="rounded p-0.5 hover:text-white disabled:opacity-30"
                        >
                          <IconeChevronUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoverGrupo(gruposOrdenados, indiceGrupo, 1)}
                          disabled={indiceGrupo === gruposOrdenados.length - 1}
                          aria-label={t("links.moveDown")}
                          className="rounded p-0.5 hover:text-white disabled:opacity-30"
                        >
                          <IconeChevronDown />
                        </button>
                      </div>
                      <h3 className="flex-1 truncate font-medium text-white">
                        {grupo.nome}
                        {!grupo.ativo && (
                          <span className="ml-2 rounded-full bg-neutral-800 px-2 py-0.5 text-xs font-normal text-neutral-400">
                            {t("links.groups.hidden")}
                          </span>
                        )}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleAlternarLayoutGrupo(grupo.id, grupo.layout)}
                        title={t("links.groups.layoutHint")}
                        className={`rounded-md px-2.5 py-1.5 text-xs transition hover:bg-neutral-800 ${
                          grupo.layout === "grid" ? "text-orange-400" : "text-neutral-300"
                        }`}
                      >
                        {grupo.layout === "grid" ? t("links.groups.layoutGrid") : t("links.groups.layoutLista")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAlternarGrupoAtivo(grupo.id, grupo.ativo)}
                        className="rounded-md px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-neutral-800"
                      >
                        {grupo.ativo ? t("links.groups.hide") : t("links.groups.show")}
                      </button>
                      <button
                        type="button"
                        onClick={() => iniciarEdicaoGrupo(grupo)}
                        aria-label={t("links.groups.rename")}
                        title={t("links.groups.rename")}
                        className="rounded-md p-2 transition hover:bg-neutral-800 hover:text-white"
                      >
                        <IconeEditar />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluirGrupo(grupo.id)}
                        aria-label={t("links.groups.delete")}
                        title={t("links.groups.delete")}
                        className="rounded-md p-2 text-neutral-500 transition hover:bg-red-950 hover:text-red-400"
                      >
                        <IconeExcluir />
                      </button>
                    </div>
                  )}

                  <div className="divide-y divide-neutral-900 px-3">
                    {linksDoGrupo(grupo.id).length === 0 && (
                      <p className="py-3 text-xs text-neutral-600">{t("links.groups.empty")}</p>
                    )}
                    {renderLinkOuEdicao(linksDoGrupo(grupo.id), grupo.id)}
                  </div>
                </div>
              ))}

              {erroGrupo && (
                <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                  {erroGrupo}
                </p>
              )}

              {criandoGrupo ? (
                <form onSubmit={handleCriarGrupo} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    maxLength={100}
                    autoFocus
                    placeholder={t("links.groups.namePlaceholder")}
                    value={novoGrupoNome}
                    onChange={(e) => setNovoGrupoNome(e.target.value)}
                    className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={salvandoGrupo}
                    className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
                  >
                    {t("links.groups.create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCriandoGrupo(false);
                      setNovoGrupoNome("");
                    }}
                    className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                  >
                    {t("links.cancel")}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setCriandoGrupo(true)}
                  className="w-full rounded-xl border border-dashed border-neutral-800 py-2.5 text-sm font-medium text-neutral-400 transition hover:border-neutral-700 hover:text-white"
                >
                  {t("links.groups.newGroup")}
                </button>
              )}
            </section>
          </div>
        )}

        {aba === "personalizar" && (
          <div className="mt-6 space-y-10">
            {pet && (
              <section
                className="rounded-[2rem] p-6"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${CORES[cor]}33, transparent 70%), #171717`,
                }}
              >
                <form onSubmit={handleSalvarPet} className="flex flex-col items-center gap-3">
                  <PetSvg
                    cor={cor}
                    estagioVisual={pet.estagioVisual}
                    chapeu={chapeu}
                    rosto={rosto}
                    acessorioCorpo={acessorioCorpo}
                    className="h-28 w-28"
                  />
                  <p className="font-display text-lg font-semibold text-white">
                    {t("customize.petLevel", { level: pet.nivel, xp: pet.xp })}
                  </p>

                  <div className="mt-3 w-full space-y-3">
                    <div>
                      <p className="mb-1.5 text-xs text-neutral-500">{t("customize.color")}</p>
                      <div className="flex flex-wrap gap-2">
                        {CORES_DISPONIVEIS.map((opcao) => (
                          <button
                            key={opcao}
                            type="button"
                            onClick={() => setCor(opcao)}
                            className={`h-8 w-8 rounded-full border-2 ${
                              cor === opcao ? "border-white" : "border-transparent"
                            }`}
                            style={{ backgroundColor: CORES[opcao] }}
                            aria-label={opcao}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs text-neutral-500">{t("customize.hat")}</p>
                      <div className="flex flex-wrap gap-2">
                        {chapeusVisiveis.map((opcao) => (
                          <button
                            key={opcao}
                            type="button"
                            onClick={() => setChapeu(opcao)}
                            className={`rounded-full border px-3 py-1 text-xs ${
                              chapeu === opcao
                                ? "border-orange-500 text-orange-400"
                                : "border-neutral-700 text-neutral-400"
                            }`}
                          >
                            {t(`customize.hats.${opcao}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs text-neutral-500">{t("customize.face")}</p>
                      <div className="flex flex-wrap gap-2">
                        {ROSTOS_DISPONIVEIS.map((opcao) => (
                          <button
                            key={opcao}
                            type="button"
                            onClick={() => setRosto(opcao)}
                            className={`rounded-full border px-3 py-1 text-xs ${
                              rosto === opcao
                                ? "border-orange-500 text-orange-400"
                                : "border-neutral-700 text-neutral-400"
                            }`}
                          >
                            {t(`customize.faces.${opcao}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs text-neutral-500">{t("customize.accessory")}</p>
                      <div className="flex flex-wrap gap-2">
                        {ACESSORIOS_CORPO_DISPONIVEIS.map((opcao) => (
                          <button
                            key={opcao}
                            type="button"
                            onClick={() => setAcessorioCorpo(opcao)}
                            className={`rounded-full border px-3 py-1 text-xs ${
                              acessorioCorpo === opcao
                                ? "border-orange-500 text-orange-400"
                                : "border-neutral-700 text-neutral-400"
                            }`}
                          >
                            {t(`customize.accessories.${opcao}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {erroPet && (
                    <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                      {erroPet}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={salvandoPet || petSemAlteracoes}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
                  >
                    {salvandoPet ? t("customize.savingPet") : t("customize.savePet")}
                  </button>
                </form>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-sm font-medium text-neutral-300">{t("customize.bio")}</h2>
              <form onSubmit={handleSalvarBio} className="space-y-2">
                <textarea
                  maxLength={280}
                  rows={3}
                  placeholder={t("customize.bioPlaceholder")}
                  value={bioValor}
                  onChange={(e) => setBioOverride(e.target.value)}
                  className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">{bioValor.length}/280</span>
                  <button
                    type="submit"
                    disabled={salvandoBio}
                    className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
                  >
                    {salvandoBio ? t("customize.savingPet") : t("customize.saveBio")}
                  </button>
                </div>
                {erroBio && (
                  <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                    {erroBio}
                  </p>
                )}
              </form>
            </section>

            <section>
              <h2 className="mb-1 text-sm font-medium text-neutral-300">{t("customize.tagsTitle")}</h2>
              <p className="mb-3 text-xs text-neutral-500">{t("customize.tagsHint", { max: TAGS_MAXIMO })}</p>
              <form onSubmit={handleSalvarTags} className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {TAGS_DISPONIVEIS.map((opcao) => (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => alternarTag(opcao)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        tagsSelecionadas.includes(opcao)
                          ? "border-orange-500 text-orange-400"
                          : "border-neutral-700 text-neutral-400"
                      }`}
                    >
                      {tTags(opcao)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">{tagsSelecionadas.length}/{TAGS_MAXIMO}</span>
                  <button
                    type="submit"
                    disabled={salvandoTags}
                    className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
                  >
                    {salvandoTags ? t("customize.savingTags") : t("customize.saveTags")}
                  </button>
                </div>
                {erroTags && (
                  <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                    {erroTags}
                  </p>
                )}
              </form>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium text-neutral-300">{t("customize.theme")}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {TEMAS_DISPONIVEIS.map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => handleSalvarTema(opcao)}
                    disabled={salvandoTema}
                    className={`rounded-full border px-3 py-1.5 text-xs disabled:opacity-50 ${
                      tema === opcao
                        ? "border-orange-500 text-orange-400"
                        : "border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {t(`customize.themes.${opcao}`)}
                  </button>
                ))}
                <label
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    tema === "custom"
                      ? "border-orange-500 text-orange-400"
                      : "border-neutral-700 text-neutral-400"
                  }`}
                >
                  <input
                    type="color"
                    value={corPersonalizada}
                    onChange={(e) => handleSalvarTema("custom", e.target.value)}
                    disabled={salvandoTema}
                    className="h-4 w-4 cursor-pointer rounded border-none bg-transparent p-0"
                  />
                  {t("customize.themes.custom")}
                </label>
              </div>
              {erroTema && (
                <p className="mt-3 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                  {erroTema}
                </p>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium text-neutral-300">{t("customize.font")}</h2>
              <div className="flex flex-wrap gap-2">
                {FONTES_DISPONIVEIS.map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => handleSalvarAparencia({ fonte: opcao })}
                    disabled={salvandoAparencia}
                    style={{ fontFamily: fontFamilyDaFonte(opcao) }}
                    className={`rounded-full border px-3 py-1.5 text-xs disabled:opacity-50 ${
                      fonte === opcao
                        ? "border-orange-500 text-orange-400"
                        : "border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {t(`customize.fonts.${opcao}`)}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium text-neutral-300">{t("customize.buttonShape")}</h2>
              <div className="flex flex-wrap gap-2">
                {FORMATOS_BOTAO_DISPONIVEIS.map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => handleSalvarAparencia({ formatoBotao: opcao })}
                    disabled={salvandoAparencia}
                    className={`border px-3 py-1.5 text-xs disabled:opacity-50 ${classeFormatoBotao(opcao)} ${
                      formatoBotao === opcao
                        ? "border-orange-500 text-orange-400"
                        : "border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {t(`customize.buttonShapes.${opcao}`)}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium text-neutral-300">{t("customize.buttonStyle")}</h2>
              <div className="flex flex-wrap gap-2">
                {ESTILOS_BOTAO_DISPONIVEIS.map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => handleSalvarAparencia({ estiloBotao: opcao })}
                    disabled={salvandoAparencia}
                    className={`rounded-full border px-3 py-1.5 text-xs disabled:opacity-50 ${
                      estiloBotao === opcao
                        ? "border-orange-500 text-orange-400"
                        : "border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {t(`customize.buttonStyles.${opcao}`)}
                  </button>
                ))}
              </div>
              {erroAparencia && (
                <p className="mt-3 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                  {erroAparencia}
                </p>
              )}
            </section>
          </div>
        )}

        {aba === "contatos" && (
          <div className="mt-6 space-y-6">
            <section>
              <label className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <input
                  type="checkbox"
                  checked={captarContatoAtivo}
                  onChange={handleAlternarCaptarContato}
                  disabled={salvandoCaptarContato}
                  className="mt-0.5 h-4 w-4 accent-orange-500"
                />
                <span>
                  <span className="block text-sm font-medium text-white">{t("contatos.enableLabel")}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500">{t("contatos.enableHint")}</span>
                </span>
              </label>
              {erroCaptarContato && (
                <p className="mt-3 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                  {erroCaptarContato}
                </p>
              )}
            </section>

            <section className="divide-y divide-neutral-900">
              {carregandoContatos && (
                <p className="text-sm text-neutral-500">{t("contatos.loading")}</p>
              )}
              {!carregandoContatos && contatos.length === 0 && (
                <p className="text-sm text-neutral-500">{t("contatos.empty")}</p>
              )}
              {contatos.map((contato) => (
                <div key={contato.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    {contato.email && <p className="truncate text-sm text-white">{contato.email}</p>}
                    {contato.whatsapp && <p className="truncate text-sm text-white">{contato.whatsapp}</p>}
                    <p className="text-xs text-neutral-600">
                      {new Date(contato.criadoEm).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExcluirContato(contato.id)}
                    disabled={excluindoContatoId === contato.id}
                    className="shrink-0 rounded-md px-2.5 py-1.5 text-xs text-neutral-400 transition hover:bg-red-950 hover:text-red-400 disabled:opacity-50"
                  >
                    {t("contatos.delete")}
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}

        {aba === "compartilhar" && (
          <div className="mt-6">
            <h2 className="mb-1 text-sm font-medium text-neutral-300">{t("share.title")}</h2>
            <a
              href={`/${usuario.userName}`}
              target="_blank"
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              linkpet.com/{usuario.userName}
            </a>

            <div className="mt-6 flex flex-col items-center gap-3">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrCodeUrl} alt={t("share.qrAlt")} className="rounded-lg bg-white p-3" />
              ) : (
                <div className="flex h-[264px] w-[264px] items-center justify-center rounded-lg border border-dashed border-neutral-800 text-sm text-neutral-600">
                  {t("share.qrPlaceholder")}
                </div>
              )}
              <button
                type="button"
                onClick={handleMostrarQrCode}
                disabled={gerandoQr}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
              >
                {gerandoQr ? t("share.generating") : qrCodeUrl ? t("share.hideQr") : t("share.generateQr")}
              </button>
            </div>

            <div className="mt-10">
              <h2 className="mb-3 text-sm font-medium text-neutral-300">{t("analytics.title")}</h2>
              <EstatisticasPerfil usuarioId={usuario.id} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
