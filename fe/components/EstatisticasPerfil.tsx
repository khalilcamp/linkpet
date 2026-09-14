"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { obterEstatisticas, EstatisticasPerfilDTO, EstatisticaItemDTO } from "@/lib/api";

function bandeiraDoPais(codigo: string) {
  return codigo
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function ListaEstatistica({
  itens,
  total,
  formatarRotulo,
}: {
  itens: EstatisticaItemDTO[];
  total: number;
  formatarRotulo: (rotulo: string) => string;
}) {
  if (itens.length === 0) return null;
  const maximo = Math.max(...itens.map((i) => i.quantidade));

  return (
    <div className="space-y-1.5">
      {itens.map((item) => (
        <div key={item.rotulo} className="flex items-center gap-2 text-xs">
          <span className="w-24 shrink-0 truncate text-neutral-400">{formatarRotulo(item.rotulo)}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${(item.quantidade / maximo) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-neutral-500">{item.quantidade}</span>
        </div>
      ))}
    </div>
  );
}

export default function EstatisticasPerfil({ usuarioId }: { usuarioId: number }) {
  const t = useTranslations("dashboard.analytics");
  const [dados, setDados] = useState<EstatisticasPerfilDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    obterEstatisticas(usuarioId, 30)
      .then(setDados)
      .catch(() => setErro(t("genericError")))
      .finally(() => setCarregando(false));
  }, [usuarioId]);

  if (carregando) {
    return <p className="text-xs text-neutral-500">{t("loading")}</p>;
  }
  if (erro) {
    return <p className="text-xs text-red-400">{erro}</p>;
  }
  if (!dados || dados.total === 0) {
    return <p className="text-xs text-neutral-500">{t("empty")}</p>;
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-300">{t("total", { total: dados.total })}</p>

      {dados.origens.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-neutral-400">{t("origens")}</p>
          <ListaEstatistica
            itens={dados.origens}
            total={dados.total}
            formatarRotulo={(rotulo) => (rotulo === "direto" ? t("direto") : rotulo)}
          />
        </div>
      )}

      {dados.dispositivos.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-neutral-400">{t("dispositivos")}</p>
          <ListaEstatistica
            itens={dados.dispositivos}
            total={dados.total}
            formatarRotulo={(rotulo) => t(`dispositivo.${rotulo}`)}
          />
        </div>
      )}

      {dados.paises.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-neutral-400">{t("paises")}</p>
          <ListaEstatistica
            itens={dados.paises}
            total={dados.total}
            formatarRotulo={(rotulo) => `${bandeiraDoPais(rotulo)} ${rotulo}`}
          />
        </div>
      )}
    </div>
  );
}
