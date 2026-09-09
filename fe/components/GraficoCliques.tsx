"use client";

import { useState } from "react";
import { LinkCliqueDiaDTO } from "@/lib/api";

function formatarDiaMes(data: string) {
  return `${data.slice(8, 10)}/${data.slice(5, 7)}`;
}

export default function GraficoCliques({ dados }: { dados: LinkCliqueDiaDTO[] }) {
  const [indiceAtivo, setIndiceAtivo] = useState<number | null>(null);

  if (dados.length === 0) {
    return (
      <p className="text-xs text-neutral-500">Sem dados de cliques ainda.</p>
    );
  }

  const maximo = Math.max(1, ...dados.map((d) => d.quantidade));
  const indicePico = dados.reduce(
    (melhorIndice, d, i, arr) =>
      d.quantidade > arr[melhorIndice].quantidade ? i : melhorIndice,
    0
  );
  const picoTemCliques = dados[indicePico].quantidade > 0;

  return (
    <div>
      <p className="mb-4 text-xs font-medium text-neutral-400">
        Cliques nos últimos {dados.length} dias
      </p>
      <div className="flex items-end gap-0.5" style={{ height: 64 }}>
        {dados.map((dia, i) => {
          const altura = Math.max(3, (dia.quantidade / maximo) * 56);
          const ativo = indiceAtivo === i;
          return (
            <div
              key={dia.data}
              className="relative flex flex-1 flex-col items-center"
            >
              {ativo && (
                <div className="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded-md bg-neutral-800 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
                  {dia.quantidade} clique{dia.quantidade === 1 ? "" : "s"}
                </div>
              )}
              {!ativo && i === indicePico && picoTemCliques && (
                <span className="pointer-events-none absolute -top-4 text-[10px] font-medium text-orange-400">
                  {dia.quantidade}
                </span>
              )}
              {/* O botão ocupa a coluna inteira (área de hover maior que a
                  barra) — uma barra de 3px de altura seria impossível de
                  passar o mouse em cima. */}
              <button
                type="button"
                onMouseEnter={() => setIndiceAtivo(i)}
                onMouseLeave={() => setIndiceAtivo(null)}
                onFocus={() => setIndiceAtivo(i)}
                onBlur={() => setIndiceAtivo(null)}
                aria-label={`${dia.quantidade} clique${dia.quantidade === 1 ? "" : "s"} em ${formatarDiaMes(dia.data)}`}
                className="flex h-full w-full max-w-6 flex-col justify-end outline-none"
              >
                <span
                  className={`w-full rounded-t-[4px] transition-colors ${
                    ativo ? "bg-orange-400" : "bg-orange-500/70"
                  }`}
                  style={{ height: altura }}
                />
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-0.5 border-t border-neutral-800 pt-1.5">
        {dados.map((dia) => (
          <span
            key={dia.data}
            className="flex-1 text-center text-[10px] text-neutral-600"
          >
            {formatarDiaMes(dia.data)}
          </span>
        ))}
      </div>
    </div>
  );
}
