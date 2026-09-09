// Selo de conquistas do usuário — definido aqui (não no backend) porque é
// puramente conteúdo/design; o backend só manda os códigos que o usuário tem.

interface BadgeInfo {
  nome: string;
  descricao: string;
  cor: string;
}

const BADGES: Record<string, BadgeInfo> = {
  developer: {
    nome: "Desenvolvedor oficial",
    descricao: "Criador do LinkPet",
    cor: "#f97316",
  },
  first100: {
    nome: "Primeiros 100",
    descricao: "Uma das 100 primeiras contas do LinkPet",
    cor: "#38bdf8",
  },
};

function Glifo({ codigo, cor }: { codigo: string; cor: string }) {
  switch (codigo) {
    case "developer":
      return (
        <path
          d="M12 3.2 18.5 6v5c0 4.4-2.8 7.3-6.5 8.8C8.3 18.3 5.5 15.4 5.5 11V6L12 3.2Z M9 12l2 2 4-4.2"
          fill="none"
          stroke={cor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "first100":
      return (
        <path
          d="M12 3c2.1 2.4 3.2 4.9 3.2 7.3a3.2 3.2 0 1 1-6.4 0C8.8 7.9 9.9 5.4 12 3Z M9.2 15c-1.6.9-2.7 2.4-2.7 4.2M14.8 15c1.6.9 2.7 2.4 2.7 4.2"
          fill="none"
          stroke={cor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    default:
      return null;
  }
}

export default function Badges({ codigos }: { codigos: string[] }) {
  const validos = codigos.filter((codigo) => BADGES[codigo]);
  if (validos.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {validos.map((codigo) => {
        const info = BADGES[codigo];
        return (
          <div
            key={codigo}
            title={info.descricao}
            className="flex items-center gap-1 rounded-full border px-2 py-0.5"
            style={{ borderColor: `${info.cor}55`, background: `${info.cor}1a` }}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
              <Glifo codigo={codigo} cor={info.cor} />
            </svg>
            <span className="text-[11px] font-medium" style={{ color: info.cor }}>
              {info.nome}
            </span>
          </div>
        );
      })}
    </div>
  );
}
