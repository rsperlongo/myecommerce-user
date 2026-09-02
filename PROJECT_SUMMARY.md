# MyCommerce User Service

Documento unico de referencia para executar, testar e entender o servico de usuarios.

## Visao geral

Servico HTTP construido com NestJS 11 e TypeScript. A organizacao segue Clean Architecture e conceitos de DDD:

- `src/domain`: entidade `UserEntity`, enum de roles, regras de hierarquia e excecoes.
- `src/application`: casos de uso de criacao, consulta, atualizacao e exclusao.
- `src/modules/auth`: controllers, DTOs, JWT, guards, decorators e servicos de autenticacao.
- `src/infrastructure`: TypeORM/PostgreSQL, Mongoose/MongoDB, Redis, RabbitMQ e Graylog.
- `test`: teste E2E basico da rota raiz.

## Requisitos

- Node.js 18 ou superior.
- npm.
- Docker e Docker Compose.

## Configuracao e execucao

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Subir a infraestrutura local
docker-compose up -d

# Iniciar em desenvolvimento
npm run start:dev
```

A API fica disponivel em `http://localhost:3000`.

O projeto usa variaveis de ambiente para conexoes. Quando existir `.env.example`, copie-o para `.env` e revise os valores:

```bash
cp .env.example .env
```

### Servicos Docker

| Servico | Porta | Uso |
|---|---:|---|
| PostgreSQL 16 | 5432 | Banco relacional principal |
| MongoDB 7 | 27017 | Armazenamento documental |
| Redis 7 | 6379 | Cache |
| RabbitMQ | 5672 | Mensageria |
| RabbitMQ Management | 15672 | Interface web |
| Graylog | 9000 | Logs centralizados |

Credenciais locais definidas no Compose: PostgreSQL `postgres/postgres`, RabbitMQ `guest/guest` e Graylog `admin/password`. Altere todos os segredos antes de qualquer uso fora do ambiente local.

Comandos uteis:

```bash
docker-compose ps
docker-compose logs -f postgres
docker-compose down
docker-compose down -v # remove os volumes e os dados locais
```

## Scripts npm

```bash
npm run start:dev  # desenvolvimento com watch
npm run start      # execucao normal
npm run build      # compilacao
npm run start:prod # executa dist/main.js
npm test           # testes unitarios
npm run test:e2e   # testes E2E
npm run test:cov   # cobertura
npm run lint       # ESLint com correcao
npm run format     # Prettier
```

Validacao minima antes de publicar uma alteracao:

```bash
npm run build
npm test
npm run test:e2e
```

O teste E2E atual verifica `GET /` e espera `Hello World!`. Os testes especificos do CRUD/RBAC descritos em documentos antigos eram exemplos de cURL e scripts projetados, nao arquivos de teste versionados neste repositorio.

## API

Todos os endpoints abaixo usam `http://localhost:3000` como base. Envie `Content-Type: application/json` nos endpoints com corpo.

### Autenticacao

#### `POST /auth/register/public`
Registro publico. Nao exige JWT e sempre cria o usuario com role `user`.

```json
{"email":"user@example.com","password":"password123"}
```

#### `POST /auth/login`
Recebe `email` e `password` e retorna um JWT e os dados do usuario.

```json
{"email":"user@example.com","password":"password123"}
```

Resposta principal: `access_token` e `user`.

Importante: o login atual e mockado; ele nao consulta nem valida a senha no repositorio. O token e gerado com o email recebido e role `user`.

#### `POST /auth/register`
Exige `Authorization: Bearer <token>` e permite acesso a `ADMIN`, `MANAGER` e `USER`. A role solicitada ainda e validada pelo caso de uso RBAC.

#### `GET /auth/profile`
Exige JWT e retorna o perfil do usuario autenticado.

#### `GET /auth/available-roles`
Exige JWT e role `ADMIN` ou `MANAGER`. Retorna as roles que o usuario pode atribuir.

### CRUD de usuarios

Todos os endpoints `/users` exigem JWT.

#### `POST /users`
Cria usuario. Roles permitidas por quem cria:

- `ADMIN`: `admin`, `manager`, `user`, `guest`.
- `MANAGER`: `user`, `guest`.
- `USER`: `guest`.
- `GUEST`: nenhuma.

Sem `roles`, o padrao e `user`. A senha e transformada em hash antes do caso de uso.

#### `GET /users`
Exige `ADMIN` ou `MANAGER`. Suporta paginacao, busca por email, filtro por roles/status e ordenacao:

```text
/users?page=1&limit=10&search=user&roles=user,guest&isActive=true&sortBy=createdAt&sortOrder=DESC
```

#### `GET /users/:id`
Consulta um usuario conforme a hierarquia: `ADMIN` ve todos; `MANAGER` ve `USER` e `GUEST`; `USER` ve `GUEST` e o proprio perfil; qualquer role pode consultar o proprio perfil.

#### `GET /users/stats/summary`
Exige `ADMIN` ou `MANAGER`. Retorna estatisticas; a implementacao atual usa valores mockados.

#### `PUT /users/:id`
Atualiza email, senha, roles e status conforme as permissoes. O proprio usuario pode atualizar seus dados, mas nao os proprios roles. `ADMIN` pode atualizar qualquer usuario e `MANAGER` pode atualizar `USER` e `GUEST`.

#### `DELETE /users/:id`
Exige `ADMIN` e executa soft delete: marca `isActive` como `false`. Nao permite autoexclusao, bloquearia a remocao do ultimo admin e verifica dependencias.

#### `POST /users/:id/reactivate`
Exige `ADMIN` e reativa o usuario.

### Formato comum de resposta

As respostas do CRUD usam `message`, `data` e, na listagem, `pagination`. O `UserResponseDto` expoe somente `id`, `email`, `roles`, `isActive`, `createdAt` e `updatedAt`; a senha nao e retornada.

Exemplo de chamada:

```bash
curl -X POST http://localhost:3000/auth/register/public \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Regras de negocio RBAC

As roles sao definidas em `src/domain/enums/user-role.enum.ts`:

```text
ADMIN > MANAGER > USER > GUEST
```

`ROLE_HIERARCHY` define quais roles um usuario pode acessar, e `hasPermission` verifica essa relacao. `canCreateUserWithRole` aplica as regras de criacao. A autorizacao acontece em dois niveis:

1. `RolesGuard` protege endpoints decorados com `@Roles(...)`.
2. Os casos de uso repetem as validacoes de negocio para impedir que uma chamada interna contorne a autorizacao HTTP.

Regras principais:

| Acao | ADMIN | MANAGER | USER | GUEST |
|---|---|---|---|---|
| Criar ADMIN | Sim | Nao | Nao | Nao |
| Criar MANAGER | Sim | Nao | Nao | Nao |
| Criar USER | Sim | Sim | Nao | Nao |
| Criar GUEST | Sim | Sim | Sim | Nao |
| Listar usuarios | Todos | USER/GUEST | Nao | Nao |
| Atualizar outros | Todos | USER/GUEST | Nao | Nao |
| Atualizar proprio perfil | Sim, sem roles | Sim, sem roles | Sim, sem roles | Sim, sem roles |
| Desativar/reativar | Sim | Nao | Nao | Nao |

Regras adicionais implementadas no CRUD:

- email deve ser valido e unico conforme os DTOs/casos de uso;
- novos usuarios sao ativos e recebem `USER` por padrao;
- nao e permitido alterar os proprios roles;
- nao e permitido autoexcluir a conta;
- a desativacao preserva o registro;
- a senha recebida pelo controller e encaminhada para hash;
- erros de autenticacao retornam `401`, falta de permissao retorna `403` e violacoes de negocio podem retornar `400`.

## Limitacoes conhecidas

- O login ainda e demonstrativo e precisa de autenticacao real contra o repositorio.
- Alguns casos de uso e estatisticas usam dados mockados; a persistencia real deve ser conectada antes de producao.
- Nao ha suite automatizada dedicada ao CRUD/RBAC; os exemplos antigos foram consolidados como referencia manual nesta pagina.
- Credenciais e segredos do Compose sao apenas para desenvolvimento local.

## Documentacao consolidada

Este arquivo substitui os documentos redundantes da raiz:

- `QUICK_START.md`, `COMPLETE_SETUP.md` e `MICROSERVICES_SETUP.md`: setup, arquitetura, Docker e comandos.
- `RBAC_IMPLEMENTATION.md` e `RBAC_EXAMPLES.md`: hierarquia, regras e cenarios de autorizacao.
- `USERS_CRUD_DOCUMENTATION.md` e `TEST_CRUD_EXAMPLES.md`: endpoints CRUD e exemplos de teste manual.
- `CRUD_IMPLEMENTATION_SUMMARY.md` e `IMPLEMENTATION_CHECKLIST.md`: inventario e checklist da implementacao.
- `README.md`: README padrao do NestJS, sem informacoes especificas do servico.
- `code-review-report.md`, `CODE_REVIEWER_AGENT_SUMMARY.md`: relatorios historicos de code review, sem instrucoes necessarias para executar a aplicacao.

A documentacao operacional dos agentes em `.kiro/agents/*.md` foi mantida porque pertence ao tooling de code review, nao ao funcionamento da API.
