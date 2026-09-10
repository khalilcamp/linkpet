"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cadastrarUsuario } from "@/lib/api";
import PetSvg from "@/components/PetSvg";

export default function CadastroPage() {
  const t = useTranslations("cadastro");
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const usernameLimpo = userName.trim();
  const inicial = usernameLimpo ? usernameLimpo[0].toUpperCase() : "?";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      await cadastrarUsuario({ userName, userEmail, senha });
      router.push("/login?cadastrado=1");
    } catch (err) {
      setErro(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-neutral-950 text-white md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 md:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <PetSvg cor="laranja" estagioVisual={1} className="h-7 w-7" />
            LinkPet
          </Link>

          <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {t("subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-neutral-300">
                {t("usernameLabel")}
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="joaosilva"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
              />
              <p className="mt-1 text-xs text-neutral-500">
                {t("usernameHint")}
              </p>
            </div>

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
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-neutral-300">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                required
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
                title={t("passwordHint")}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-600 outline-none focus:border-orange-500"
              />
              <p className="mt-1 text-xs text-neutral-500">
                {t("passwordHint")}
              </p>
            </div>

            {erro && (
              <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-orange-500 py-2 font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
            >
              {carregando ? t("submitLoading") : t("submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            {t("hasAccount")}{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300">
              {t("login")}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center border-t border-neutral-900 bg-neutral-900/40 px-6 py-16 md:border-l md:border-t-0">
        <p className="mb-5 text-sm text-neutral-400">
          {t("previewLabel")}
        </p>

        <div className="w-full max-w-[260px] rounded-[2rem] border border-neutral-800 bg-neutral-950 p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-xl font-semibold text-orange-400">
            {inicial}
          </div>
          <p className="mt-3 font-display text-lg font-semibold">
            @{usernameLimpo || "seuusuario"}
          </p>
          <p className="text-xs text-neutral-500">
            linkpet.com/{usernameLimpo || "seuusuario"}
          </p>

          <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <PetSvg cor="laranja" estagioVisual={0} className="mx-auto h-16 w-16" />
            <p className="mt-1 text-xs text-neutral-500">{t("previewLevel")}</p>
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-9 rounded-xl border border-neutral-800 bg-neutral-900/60" />
            <div className="h-9 rounded-xl border border-neutral-800 bg-neutral-900/60" />
          </div>
        </div>

        <p className="mt-5 max-w-[260px] text-center text-xs text-neutral-600">
          {t("previewFooter")}
        </p>
      </div>
    </main>
  );
}
