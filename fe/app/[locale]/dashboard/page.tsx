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
  removerToken,
  buscarPaginaPublica,
  customizarPet,
  atualizarTema,
  atualizarBio,
  atualizarTagsPerfil,
  uploadFoto,
  historicoCliques,
  urlImagem,
  reenviarConfirmacaoEmail,
  LinkResponseDTO,
  LinkCliqueDiaDTO,
  PetResponseDTO,
} from "@/lib/api";
import PetSvg, {
  CORES,
  CORES_DISPONIVEIS,
  CHAPEUS_DISPONIVEIS,
  ROSTOS_DISPONIVEIS,
  ACESSORIOS_CORPO_DISPONIVEIS,
} from "@/components/PetSvg";
import GraficoCliques from "@/components/GraficoCliques";
import { TEMAS_DISPONIVEIS } from "@/lib/temas";
import { TAGS_DISPONIVEIS, TAGS_MAXIMO } from "@/lib/perfilTags";
import QRCode from "qrcode";

const ABAS = ["links", "personalizar", "compartilhar"] as const;

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

  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [pictureLink, setPictureLink] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editPictureLink, setEditPictureLink] = useState("");
  const [editDataInicio, setEditDataInicio] = useState("");
  const [editDataFim, setEditDataFim] = useState("");
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
  const [salvandoTema, setSalvandoTema] = useState(false);
  const [erroTema, setErroTema] = useState<string | null>(null);
  const tema = temaOverride ?? usuario?.tema ?? "escuro";

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

  async function handleSalvarTema(novoTema: string) {
    if (!usuario) return;

    setErroTema(null);
    setSalvandoTema(true);

    try {
      const atualizado = await atualizarTema(usuario.id, novoTema);
      setTemaOverride(atualizado.tema);
    } catch (err) {
      setErroTema(err instanceof Error ? err.message : t("customize.genericThemeError"));
    } finally {
      setSalvandoTema(false);
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
        url,
        label,
        pictureLink: pictureLink || undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      });
      setLinks((atual) => [...atual, novoLink]);
      setUrl("");
      setLabel("");
      setPictureLink("");
      setDataInicio("");
      setDataFim("");
      setMostrarNovoLink(false);
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : t("links.genericCreateError"));
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(link: LinkResponseDTO) {
    setEditandoId(link.linkId);
    setEditUrl(link.url);
    setEditLabel(link.label);
    setEditPictureLink(link.pictureLink || "");
    setEditDataInicio(link.dataInicio || "");
    setEditDataFim(link.dataFim || "");
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
        url: editUrl,
        label: editLabel,
        pictureLink: editPictureLink || undefined,
        dataInicio: editDataInicio || undefined,
        dataFim: editDataFim || undefined,
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
  const linksOrdenados = [...links].sort((a, b) => a.position - b.position);

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
                  <input
                    type="text"
                    required
                    placeholder={t("links.titlePlaceholder")}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                  />
                  <input
                    type="url"
                    required
                    placeholder={t("links.urlPlaceholder")}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                  />
                  <input
                    type="url"
                    placeholder={t("links.iconUrlPlaceholder")}
                    value={pictureLink}
                    onChange={(e) => setPictureLink(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                  />
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

            <section className="divide-y divide-neutral-900">
              {carregandoLinks && (
                <p className="text-sm text-neutral-500">{t("links.loadingLinks")}</p>
              )}

              {!carregandoLinks && links.length === 0 && !mostrarNovoLink && (
                <p className="text-sm text-neutral-500">
                  {t("links.noLinks")}
                </p>
              )}

              {linksOrdenados.map((link, index) =>
                editandoId === link.linkId ? (
                  <form
                    key={link.linkId}
                    onSubmit={(e) => handleSalvarEdicao(e, link.linkId)}
                    className="space-y-2 rounded-xl border border-neutral-700 bg-neutral-900 p-4"
                  >
                    <input
                      type="text"
                      required
                      placeholder={t("links.editTitlePlaceholder")}
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                    />
                    <input
                      type="url"
                      required
                      placeholder={t("links.urlPlaceholder")}
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                    />
                    <input
                      type="url"
                      placeholder={t("links.iconUrlPlaceholder")}
                      value={editPictureLink}
                      onChange={(e) => setEditPictureLink(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
                    />
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
                  <div key={link.linkId}>
                    <div className="flex items-center gap-3 py-4">
                      {link.pictureLink && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={link.pictureLink}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-white">
                            {link.label}
                          </p>
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
                        <p className="truncate text-sm text-neutral-500">
                          {link.url}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {t("links.clicks", { count: link.cliques })}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1 text-neutral-500">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMoverLink(linksOrdenados, index, -1)}
                            disabled={index === 0}
                            aria-label={t("links.moveUp")}
                            className="rounded p-0.5 hover:text-white disabled:opacity-30"
                          >
                            <IconeChevronUp />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoverLink(linksOrdenados, index, 1)}
                            disabled={index === linksOrdenados.length - 1}
                            aria-label={t("links.moveDown")}
                            className="rounded p-0.5 hover:text-white disabled:opacity-30"
                          >
                            <IconeChevronDown />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAlternarHistorico(link.linkId)}
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
                          onClick={() => iniciarEdicao(link)}
                          aria-label={t("links.editLink")}
                          title={t("links.edit")}
                          className="rounded-md p-2 transition hover:bg-neutral-800 hover:text-white"
                        >
                          <IconeEditar />
                        </button>
                        {link.ativo ? (
                          <button
                            type="button"
                            onClick={() => handleExcluirLink(link.linkId)}
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
                            onClick={() => handleReativarLink(link.linkId)}
                            className="rounded-md px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-neutral-800"
                          >
                            {t("links.reactivate")}
                          </button>
                        )}
                      </div>
                    </div>

                    {historicoAbertoId === link.linkId && (
                      <div className="pb-4">
                        {carregandoHistorico && (
                          <p className="text-xs text-neutral-500">{t("links.loadingHistory")}</p>
                        )}
                        {!carregandoHistorico && historicoDados && (
                          <GraficoCliques dados={historicoDados} />
                        )}
                      </div>
                    )}
                  </div>
                )
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
              <div className="flex flex-wrap gap-2">
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
              </div>
              {erroTema && (
                <p className="mt-3 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                  {erroTema}
                </p>
              )}
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
          </div>
        )}
      </div>
    </main>
  );
}
