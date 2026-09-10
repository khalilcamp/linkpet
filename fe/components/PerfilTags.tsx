// Tags de auto-declaração ("Eu sou..."), escolhidas pelo próprio usuário —
// exibidas em estilo neutro (sem cor própria) pra diferenciar visualmente
// das badges conquistadas/concedidas (ver Badges.tsx).

import { useTranslations } from "next-intl";
import { TAGS_DISPONIVEIS } from "@/lib/perfilTags";

export default function PerfilTags({ codigos }: { codigos: string[] }) {
  const t = useTranslations("perfilTags");
  const validas = codigos.filter((codigo) => (TAGS_DISPONIVEIS as readonly string[]).includes(codigo));
  if (validas.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {validas.map((codigo) => (
        <span
          key={codigo}
          className="rounded-full border border-neutral-700 bg-neutral-900/60 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300"
        >
          {t(codigo)}
        </span>
      ))}
    </div>
  );
}
