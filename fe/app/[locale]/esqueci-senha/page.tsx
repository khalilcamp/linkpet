"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { esqueciSenha } from "@/lib/api";

export default function EsqueciSenhaPage() {
  const t = useTranslations("esqueciSenha");
  const [userEmail, setUserEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      await esqueciSenha(userEmail);
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
        </div>

        {enviado ? (
          <p className="rounded-lg bg-green-950 px-3 py-2 text-center text-sm text-green-400">
            {t("sentMessage")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-neutral-300">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-neutral-500"
              />
            </div>

            {erro && (
              <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-white py-2 font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
            >
              {carregando ? t("submitLoading") : t("submit")}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-neutral-500">
          <Link href="/login" className="text-white underline">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </main>
  );
}
