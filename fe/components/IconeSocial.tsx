// Ícone da plataforma usando o favicon real do domínio do link (via serviço
// de favicons do Google), em vez de manter um glifo desenhado à mão pra
// cada rede — assim funciona pra qualquer site, não só os mais comuns.

function extrairHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export default function IconeSocial({
  url,
  className = "h-6 w-6",
}: {
  url: string;
  className?: string;
}) {
  if (url.startsWith("mailto:")) {
    return (
      <svg viewBox="0 0 24 24" className={`rounded ${className}`} aria-hidden="true">
        <rect width="24" height="24" rx="6" fill="#6B7280" />
        <path
          d="M5 7.5h14v9H5v-9Zm0 0 7 5.5 7-5.5"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  const hostname = extrairHostname(url);
  if (!hostname) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
      alt=""
      className={`rounded object-contain ${className}`}
    />
  );
}
