"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { confirmarEmail } from "@/lib/api";

type Status = "carregando" | "sucesso" | "erro";

function ConfirmarEmailConteudo() {
  const t = useTranslations("confirmarEmail");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("carregando");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("erro");
      setErro(t("invalidLink"));
      return;
    }

    confirmarEmail(token)
      .then(() => setStatus("sucesso"))
      .catch((err) => {
        setStatus("erro");
        setErro(err instanceof Error ? err.message : t("genericError"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === "carregando") {
    return (
      <p className="text-center text-sm text-neutral-400">{t("loading")}</p>
    );
  }

  if (status === "sucesso") {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("successTitle")}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {t("successSubtitle")}
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block w-full rounded-lg bg-orange-500 py-2 font-medium text-black transition hover:bg-orange-400"
        >
          {t("goToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3 text-center">
      <p className="text-red-400">{erro || t("invalidOrExpired")}</p>
      <Link href="/login" className="text-sm text-white underline">
        {t("backToLogin")}
      </Link>
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <Suspense fallback={null}>
        <ConfirmarEmailConteudo />
      </Suspense>
    </main>
  );
}
