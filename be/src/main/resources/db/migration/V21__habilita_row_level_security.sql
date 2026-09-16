-- O Supabase liga por padrão uma API REST/GraphQL automática (PostgREST)
-- em cima de toda tabela do schema public. Sem RLS, qualquer um com a
-- chave "anon" do projeto consegue ler/escrever essas tabelas direto por
-- ali, sem passar pela nossa API Spring Boot (autenticação, validações,
-- etc). O app não usa o SDK do Supabase nem essa API REST em nenhum
-- lugar — todo acesso é via JDBC direto, com a role de banco configurada
-- em SPRING_DATASOURCE_*, que não é afetada por RLS. Habilitar RLS sem
-- criar nenhuma policy já bloqueia por padrão qualquer acesso via
-- PostgREST, sem exigir nada do backend.
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_like_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clique_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizacao_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE contato_capturado ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_token ENABLE ROW LEVEL SECURITY;
