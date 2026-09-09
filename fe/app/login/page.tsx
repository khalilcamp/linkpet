"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, salvarToken } from "@/lib/api";
import PetSvg from "@/components/PetSvg";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cadastrado = searchParams.get("cadastrado");
  const senhaRedefinida = searchParams.get("senha-redefinida");

  const [userName, setUserName] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const token = await login({ userName, senha });
      salvarToken(token);
      router.push("/dashboard");
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Usuário ou senha inválidos"
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-semibold tracking-tight"
        >
          <PetSvg cor="laranja" estagioVisual={1} className="h-7 w-7" />
          LinkPet
        </Link>

        <div className="mt-8 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Entrar
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Acesse seu painel de links.
          </p>
        </div>

        {cadastrado && (
          <p className="mt-6 rounded-lg bg-green-950 px-3 py-2 text-center text-sm text-green-400">
            Conta criada! Faça login para continuar.
          </p>
        )}

        {senhaRedefinida && (
          <p className="mt-6 rounded-lg bg-green-950 px-3 py-2 text-center text-sm text-green-400">
            Senha redefinida! Faça login com sua nova senha.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Nome de usuário
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm text-neutral-300">Senha</label>
              <Link
                href="/esqueci-senha"
                className="text-xs text-neutral-500 underline hover:text-neutral-300"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-orange-500"
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
            className="w-full rounded-lg bg-orange-500 py-2 font-medium text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-orange-400 hover:text-orange-300">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
