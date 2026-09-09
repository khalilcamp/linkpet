# LinkPet — Frontend

Next.js (App Router) + TypeScript + Tailwind. Consome a API Spring Boot que
já está pronta.

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # ajuste a URL da API se necessário
npm run dev
```

Abre em `http://localhost:3000`.

## Telas prontas

- `/` — home
- `/cadastro` — cria conta (`POST /usuarios`)
- `/login` — login, salva o JWT no localStorage (`POST /usuarios/login`)
- `/dashboard` — área logada: lista e cria links
- `/[username]` — página pública, sem autenticação (`GET /{username}`)

## Pendência obrigatória no backend: endpoint `GET /me`

O dashboard precisa saber o **id** do usuário logado para poder chamar
`/usuarios/{id}/links`. Hoje a API não tem nenhuma rota que devolva "quem
está autenticado agora" — só temos o token, com o `username` dentro dele.

Sem esse endpoint, o dashboard mostra um erro amigável, mas não funciona.

### O que criar

**1. No `UsuarioController`, um novo método:**

- Rota: `GET /me`
- Não recebe nenhum parâmetro no path/query
- Descobre o username do usuário autenticado através do
  `SecurityContextHolder.getContext().getAuthentication().getName()`
  (é esse `getName()` que devolve o valor que o `JwtAuthFilter` colocou no
  `UsernamePasswordAuthenticationToken` — reveja esse filtro, é o mesmo
  username que veio do token)
- Com o username em mãos, chama `usuarioService.buscarPorUsername(...)`
  (você já tem esse método pronto)
- Devolve um `UsuarioResponseDTO`, igual o endpoint de cadastro já faz

**2. No `SecurityConfig`:**

- Essa rota **não** deve entrar no `.permitAll()` — ela precisa continuar
  exigindo token, já que devolve dados de "quem sou eu". Se sua regra atual
  já é `.anyRequest().authenticated()` para tudo que não foi liberado
  explicitamente, não precisa mexer em nada aqui.

Depois de criar isso, o dashboard funciona de ponta a ponta sem mais nada.

## Decisões tomadas (para você continuar depois)

- **Token no `localStorage`** — simples para portfólio; evolução futura
  seria usar cookie `httpOnly` setado pelo backend.
- **Decodificação do JWT no frontend** (`lib/jwt.ts`) — só lê o `subject` e
  o `exp` para saber se expirou; não valida assinatura (isso é sempre
  responsabilidade do backend, o frontend só usa isso pra UX).
- **`lib/api.ts`** centraliza todas as chamadas — os tipos ali espelham os
  DTOs do backend. Se você mudar um DTO no Java, replique a mudança aqui.
- Editar / excluir / reordenar links ainda não têm tela — dependem dos
  endpoints correspondentes no backend, que ficaram como próximo passo
  combinado antes de migrarmos pro frontend.
