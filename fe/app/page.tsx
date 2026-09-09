import Link from "next/link";
import PetSvg from "@/components/PetSvg";
import IconeSocial from "@/components/IconeSocial";
import { TEMA_CLASSES, TEMA_LABEL, type Tema } from "@/lib/temas";

const CLAIMS = [
  {
    titulo: "Analytics por link",
    descricao: "Cliques por link, por dia — sem enrolação.",
  },
  {
    titulo: "QR Code instantâneo",
    descricao: "Gera na hora. Cola no bio, imprime, pronto.",
  },
  {
    titulo: "Links agendados",
    descricao: "Programe início e fim — o link aparece e some sozinho.",
  },
  {
    titulo: "Rápida pra doer",
    descricao: "Página pública leve, sem esperar carregar nada.",
  },
];

const LINKS_MOCKUP = [
  { label: "Meu portfólio", url: "https://github.com" },
  { label: "Instagram", url: "https://instagram.com" },
  { label: "YouTube", url: "https://youtube.com" },
];

const TEMAS_VITRINE: { tema: Tema; rotate: string }[] = [
  { tema: "escuro", rotate: "-rotate-6" },
  { tema: "sunset", rotate: "-rotate-2" },
  { tema: "roxo", rotate: "rotate-2" },
  { tema: "verde", rotate: "rotate-6" },
  { tema: "claro", rotate: "rotate-10" },
];

export default function Home() {
  return (
    <main className="flex-1 bg-neutral-950 text-white">
      <header className="sticky top-0 z-20 border-b border-neutral-900 bg-neutral-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <PetSvg cor="laranja" estagioVisual={1} className="h-7 w-7" />
            LinkPet
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-medium text-neutral-400 transition hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 pb-28 pt-20 md:pt-28">
        <div className="mx-auto grid max-w-6xl gap-20 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Seus links, sua página.
              <br />
              Um pet que sobe de nível com você.
            </h1>
            <p className="mt-6 max-w-md text-lg text-neutral-400">
              Cinco temas, analytics por link e um bichinho virtual que
              evolui a cada curtida que sua página recebe.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/cadastro"
                className="rounded-full bg-white px-6 py-3.5 font-semibold text-black transition hover:bg-neutral-200"
              >
                Criar minha página
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-400 underline decoration-neutral-700 underline-offset-4 transition hover:text-white"
              >
                já tenho conta
              </Link>
            </div>
          </div>

          <div className="relative mx-auto h-[360px] w-full max-w-[380px]">
            {/* Centralização e animação ficam em elementos separados: uma
                animação CSS na própria tag sobrescreveria este translate. */}
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2">
              <PetSvg
                cor="laranja"
                estagioVisual={2}
                chapeu="coroa"
                className="hero-pet-entrance h-56 w-56 drop-shadow-2xl"
              />
            </div>

            <div className="absolute left-0 top-6 rotate-[-8deg]">
              <div
                className="hero-badge-entrance rounded-2xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 shadow-xl"
                style={{ animationDelay: "0.5s" }}
              >
                <p className="text-xs font-semibold">Nível 4 · 320 XP</p>
              </div>
            </div>

            <div className="absolute right-2 top-0 rotate-6">
              <div
                className="hero-badge-entrance rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 shadow-xl"
                style={{ animationDelay: "0.65s" }}
              >
                <p className="text-xs font-semibold text-orange-400">
                  @joana.silva
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-6 -rotate-6">
              <div
                className="hero-badge-entrance flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 p-1.5 shadow-xl"
                style={{ animationDelay: "0.8s" }}
              >
                <IconeSocial url="https://instagram.com" className="h-7 w-7" />
                <IconeSocial url="https://youtube.com" className="h-7 w-7" />
                <IconeSocial url="https://github.com" className="h-7 w-7" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Escolha sua cor.
          </h2>
          <p className="mt-3 max-w-md text-neutral-400">
            Cinco temas prontos — dá pra trocar quando quiser, direto no seu
            painel.
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-6">
            {TEMAS_VITRINE.map(({ tema, rotate }) => {
              const classes = TEMA_CLASSES[tema];
              return (
                <div
                  key={tema}
                  className={`w-40 shrink-0 rounded-[1.75rem] border border-white/10 p-4 shadow-2xl ${rotate} ${classes.fundo}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${classes.card}`}
                    >
                      J
                    </div>
                    <p className={`mt-2 text-xs font-semibold ${classes.texto}`}>
                      @joana.silva
                    </p>
                    <div
                      className={`mt-3 w-full rounded-lg border px-2 py-1.5 text-[11px] font-medium ${classes.card} ${classes.texto}`}
                    >
                      Meu link
                    </div>
                  </div>
                  <p className={`mt-3 text-center text-[11px] font-medium ${classes.subtexto}`}>
                    {TEMA_LABEL[tema]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-900 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[0.9fr_1fr] md:items-center">
          <div className="space-y-8">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Tudo que sua bio precisa.
            </h2>
            {CLAIMS.map((c) => (
              <div key={c.titulo} className="flex gap-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-sm bg-orange-500" />
                <div>
                  <p className="text-lg font-semibold">{c.titulo}</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {c.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto w-full max-w-[280px] rotate-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
            <p className="text-xs font-medium text-neutral-500">
              linkpet.com/joana.silva
            </p>
            <div className="mt-4 space-y-2.5">
              {LINKS_MOCKUP.map((link) => (
                <div
                  key={link.label}
                  className="flex items-center gap-2.5 rounded-xl border border-neutral-800 bg-black/30 px-3 py-2.5"
                >
                  <IconeSocial url={link.url} className="h-6 w-6 shrink-0" />
                  <span className="text-sm font-medium">{link.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-orange-500 px-6 py-20 text-black">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Bora criar a sua?
            </h2>
            <p className="mt-2 text-black/70">
              Grátis, leva menos de um minuto.
            </p>
          </div>
          <Link
            href="/cadastro"
            className="shrink-0 rounded-full bg-black px-7 py-4 font-semibold text-white transition hover:bg-neutral-900"
          >
            Criar conta
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-900 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-neutral-500 sm:flex-row">
          <div className="flex items-center gap-2 font-medium text-neutral-300">
            <PetSvg cor="cinza" estagioVisual={1} className="h-5 w-5" />
            LinkPet
          </div>
          <p>Feito com Next.js e Spring Boot.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-neutral-300">
              Entrar
            </Link>
            <Link href="/cadastro" className="hover:text-neutral-300">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
