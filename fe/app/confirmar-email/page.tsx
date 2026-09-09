"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmarEmail } from "@/lib/api";

type Status = "carregando" | "sucesso" | "erro";

function ConfirmarEmailConteudo() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("carregando");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("erro");
      setErro("Link inválido.");
      return;
    }

    confirmarEmail(token)
      .then(() => setStatus("sucesso"))
      .catch((err) => {
        setStatus("erro");
        setErro(err instanceof Error ? err.message : "Erro ao confirmar e-mail");
      });
  }, [token]);

  if (status === "carregando") {
    return (
      <p className="text-center text-sm text-neutral-400">Confirmando seu e-mail...</p>
    );
  }

  if (status === "sucesso") {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-white">E-mail confirmado!</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Sua conta já está verificada.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block w-full rounded-lg bg-orange-500 py-2 font-medium text-black transition hover:bg-orange-400"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3 text-center">
      <p className="text-red-400">{erro || "Link inválido ou expirado."}</p>
      <Link href="/login" className="text-sm text-white underline">
        Voltar para o login
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
