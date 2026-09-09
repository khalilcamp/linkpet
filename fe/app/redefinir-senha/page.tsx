"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { redefinirSenha } from "@/lib/api";

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setErro(null);
    setCarregando(true);

    try {
      await redefinirSenha(token, novaSenha);
      router.push("/login?senha-redefinida=1");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao redefinir senha");
    } finally {
      setCarregando(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-sm space-y-3 text-center">
        <p className="text-red-400">Link inválido. Solicite uma nova redefinição.</p>
        <Link href="/esqueci-senha" className="text-sm text-white underline">
          Esqueci minha senha
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Nova senha</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Escolha uma nova senha para sua conta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            Nova senha
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="••••••••"
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
          {carregando ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <Suspense fallback={null}>
        <RedefinirSenhaForm />
      </Suspense>
    </main>
  );
}
