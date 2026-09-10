import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt-BR", "en"],
  defaultLocale: "pt-BR",
  // pt-BR (padrão) fica sem prefixo na URL; inglês ganha /en.
  localePrefix: "as-needed",
});
