"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { capturarContato } from "@/lib/api";
import type { TemaClasses } from "@/lib/temas";

export default function CapturarContatoForm({
  username,
  tema,
}: {
  username: string;
  tema: TemaClasses;
}) {
  const t = useTranslations("paginaPublica.contato");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await capturarContato(username, {
        email: email || undefined,
        whatsapp: whatsapp || undefined,
      });
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className={`rounded-xl border p-4 text-sm ${tema.card}`} style={tema.estiloCard}>
        <p className={tema.texto}>{t("obrigado")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-2 rounded-xl border p-4 text-left ${tema.card}`}
      style={tema.estiloCard}
    >
      <p className={`text-sm font-medium ${tema.texto}`}>{t("titulo")}</p>
      <input
        type="email"
        placeholder={t("emailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-neutral-700 bg-black/20 px-3 py-2 text-sm text-inherit placeholder-neutral-500 outline-none focus:border-orange-500"
      />
      <input
        type="tel"
        placeholder={t("whatsappPlaceholder")}
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="w-full rounded-lg border border-neutral-700 bg-black/20 px-3 py-2 text-sm text-inherit placeholder-neutral-500 outline-none focus:border-orange-500"
      />
      {erro && <p className="text-xs text-red-400">{erro}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
      >
        {enviando ? t("enviando") : t("enviar")}
      </button>
    </form>
  );
}
