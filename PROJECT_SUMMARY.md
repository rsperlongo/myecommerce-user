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

| Servico             | Porta | Uso                        |
| ------------------- | ----: | -------------------------- |
| PostgreSQL 16       |  5432 | Banco relacional principal |
| MongoDB 7           | 27017 | Armazenamento documental   |
| Redis 7             |  6379 | Cache                      |
| RabbitMQ            |  5672 | Mensageria                 |
| RabbitMQ Management | 15672 | Interface web              |
| Graylog             |  9000 | Logs centralizados         |

Credenciais locais definidas no Compose: PostgreSQL `postgres/postgres`, RabbitMQ `guest/guest` e Graylog `admin/password`. Altere todos os segredos antes de qualquer uso fora do ambiente local.

Comandos uteis:

```bash
docker-compose ps
docker-compose logs -f postgres
docker-compose down
docker-compose down -v # remove os volumes e os dados locais
```

### Logging

Os logs sao emitidos em JSON no console. Para enviar logs via GELF UDP ao Graylog,
configure `GRAYLOG_ENABLED=true`; opcionalmente, ajuste `GRAYLOG_HOST`,
`GRAYLOG_PORT` (padrao `12201`) e `LOG_LEVEL` (padrao `info`). Erros HTTP incluem
metodo, rota, status, mensagem e stack trace quando disponivel.

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

Todos os endpoints abaixo usam `http://localhost:3001` como base. Envie `Content-Type: application/json` nos endpoints com corpo.

### Autenticacao

#### `POST /auth/register/public`

Registro publico. Nao exige JWT e sempre cria o usuario com role `user`.

```json
{ "email": "user@example.com", "password": "password123" }
```

#### `POST /auth/login`

Recebe `email` e `password` e retorna um JWT e os dados do usuario.

```json
{ "email": "user@example.com", "password": "password123" }
```

Resposta principal: `access_token` e `user`.

Importante: o login atual e mockado; ele nao consulta nem valida a senha no repositorio. O token e gerado com o email recebido e role `user`.

#### `POST /auth/register`

Exige `Authorization: Bearer <token>` e permite acesso a `ADMIN`, `MANAGER` e `USER`. A role solicitada ainda e validada pelo caso de uso RBAC.

#### `GET /auth/profile`

Exige JWT e retorna o perfil do usuario autenticado.

#### `GET /auth/available-roles`

Exige JWT e role `ADMIN` ou `MANAGER`. Retorna as roles que o usuario pode atribuir.

### Perfil do usuario

O perfil e um recurso separado da tabela `users`, destinado aos dados pessoais
preenchidos pelo frontend. O recurso e independente da role: qualquer usuario
autenticado pode consultar e preencher o proprio perfil.

Todos os endpoints `/profile` exigem `Authorization: Bearer <token>`. O usuario
e identificado pelo email presente no JWT.

#### `GET /profile`

Retorna o perfil do usuario autenticado. Se o cadastro ainda nao foi preenchido,
retorna `404` com `User profile not found`.

#### `PUT /profile`

Cria o perfil quando ele ainda nao existe ou atualiza o perfil existente. O endpoint
funciona como upsert e nao recebe `email` no corpo da requisicao.

Para usuarios do sistema, o registro correspondente em `members` deve ser criado ou
atualizado primeiro por `PUT /members/me`. O `PUT /profile` rejeita a operacao caso o
usuario autenticado ainda nao esteja vinculado a um membro.

Payload obrigatorio:

```json
{
  "name": "Maria da Silva",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123",
  "city": "Sao Paulo",
  "uf": "SP",
  "married": false,
  "churchMember": true
}
```

Regras de negocio do perfil:

- `email` e a chave de vinculacao com `users.email`; ele e obtido do usuario autenticado e nunca pode ser alterado pelo frontend.
- O mesmo usuario possui no maximo um perfil. A tabela `user_profiles` usa o email como chave primaria.
- O perfil so pode ser criado para um email existente na tabela `users`, por meio de uma chave estrangeira.
- O perfil e excluido automaticamente quando o usuario e excluido fisicamente; a desativacao normal do usuario nao exclui o perfil.
- Alteracoes futuras no email do usuario propagam para o perfil por `ON UPDATE CASCADE`.
- `name` e obrigatorio, deve ser texto entre 2 e 150 caracteres.
- `phone` e obrigatorio e deve seguir o padrao de telefone brasileiro com DDD. Exemplos validos: `(11) 99999-9999` e `11999999999`.
- `address` e obrigatorio e aceita ate 255 caracteres.
- `city` e obrigatoria e aceita ate 100 caracteres.
- `uf` e obrigatoria, deve conter exatamente duas letras e e normalizada para maiusculas antes da persistencia.
- `married` e `churchMember` sao obrigatorios e aceitam somente valores booleanos (`true` ou `false`).
- Espacos no inicio e no fim dos campos textuais sao removidos antes de salvar.
- O frontend deve tratar `404` no `GET /profile` como perfil ainda nao preenchido e apresentar o formulario de cadastro.

### Membros

Um membro pode existir sem ser usuario do sistema. Por isso, a tabela `members` possui
identificador proprio e o campo `email` e opcional. Quando informado, o email deve
pertencer a um usuario existente e so pode estar vinculado a um membro.

Todo registro de membro representa uma pessoa que pertence a igreja; por isso
`churchMember` e obrigatorio e deve ser `true`. O campo `memberSince` registra a data
em que a pessoa se tornou membro e deve ser enviado pelo frontend no formato ISO
`YYYY-MM-DD` (por exemplo, `2010-09-05`).

#### `GET /members/me`

Exige JWT e retorna o membro vinculado ao email do usuario autenticado.

#### `PUT /members/me`

Exige JWT e cria ou atualiza o membro vinculado ao usuario autenticado. O email e
derivado do JWT e nao pode ser alterado no corpo. Esta deve ser a primeira chamada
para concluir o cadastro de um usuario como membro.

#### `POST /members`

Exige JWT e role `ADMIN` ou `MANAGER`. Cria um membro, com ou sem email. Quando o email
for informado, ele deve pertencer a um usuario existente.

#### `GET /members`

Exige JWT e role `ADMIN` ou `MANAGER`. Retorna membros paginados e aceita `search` por
nome ou email.

#### `GET /members/:id` e `PUT /members/:id`

Exigem JWT e role `ADMIN` ou `MANAGER`. Consultam ou atualizam um membro existente.

#### `DELETE /members/:id`

Exige JWT e role `ADMIN`. Remove o membro. Se ele estiver ligado a um usuario, o
usuario permanece, mas o vinculo de email e removido; o frontend deve recriar o
membro antes de tentar salvar o perfil do usuario novamente.

Payload de membro:

```json
{
  "email": "user@example.com",
  "name": "Maria da Silva",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123",
  "city": "Sao Paulo",
  "uf": "SP",
  "married": false,
  "churchMember": true,
  "memberSince": "2010-09-05"
}
```

Resposta de sucesso segue o formato comum `message` e `data`. O objeto `data` contem
os dados do perfil, incluindo o email de vinculacao e os campos de auditoria
`createdAt` e `updatedAt`.

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

Exige `ADMIN` ou `MANAGER`. Retorna estatisticas calculadas diretamente no PostgreSQL,
respeitando o escopo: `ADMIN` ve todas as roles e `MANAGER` ve apenas `USER` e `GUEST`.

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

| Acao                     | ADMIN          | MANAGER        | USER           | GUEST          |
| ------------------------ | -------------- | -------------- | -------------- | -------------- |
| Criar ADMIN              | Sim            | Nao            | Nao            | Nao            |
| Criar MANAGER            | Sim            | Nao            | Nao            | Nao            |
| Criar USER               | Sim            | Sim            | Nao            | Nao            |
| Criar GUEST              | Sim            | Sim            | Sim            | Nao            |
| Listar usuarios          | Todos          | USER/GUEST     | Nao            | Nao            |
| Atualizar outros         | Todos          | USER/GUEST     | Nao            | Nao            |
| Atualizar proprio perfil | Sim, sem roles | Sim, sem roles | Sim, sem roles | Sim, sem roles |
| Desativar/reativar       | Sim            | Nao            | Nao            | Nao            |

Regras adicionais implementadas no CRUD:

- email deve ser valido e unico conforme os DTOs/casos de uso;
- novos usuarios sao ativos e recebem `USER` por padrao;
- nao e permitido alterar os proprios roles;
- nao e permitido autoexcluir a conta;
- a desativacao preserva o registro;
- a senha recebida pelo controller e encaminhada para hash;
- erros de autenticacao retornam `401`, falta de permissao retorna `403` e violacoes de negocio podem retornar `400`.

## Estado das limitacoes

- O login consulta o repositorio, rejeita usuarios inativos, compara a senha com `bcrypt`
  e gera o JWT com as roles persistidas.
- Os casos de uso de CRUD e o resumo estatistico usam `IUserRepository`, cuja implementacao
  de producao e o repositorio TypeORM/PostgreSQL. O resumo calcula totais, status, roles e
  cadastros dos ultimos sete dias sem valores fixos.
- Ha testes unitarios de autenticacao e do escopo RBAC das estatisticas. Antes de producao,
  ainda e recomendado adicionar testes E2E com PostgreSQL para o fluxo completo de CRUD/RBAC.
- As credenciais do Compose continuam sendo somente para desenvolvimento local. Em producao,
  use Secrets Manager ou Systems Manager Parameter Store e nunca valores padrao no task definition.

## Proximo passo: AWS com ECS + Fargate

O caminho recomendado e manter a API como uma imagem Docker imutavel e executar o servico
em uma ECS Service com launch type Fargate:

1. Criar uma VPC com subnets privadas para ECS e RDS, subnets publicas somente para o
   Application Load Balancer, security groups restritivos e NAT Gateway quando a tarefa
   precisar acessar a internet para buscar dependencias externas.
2. Criar um PostgreSQL no Amazon RDS (Multi-AZ para producao), um repositorio privado no
   Amazon ECR e, se o cache/mensageria forem necessarios, escolher Amazon ElastiCache,
   Amazon MQ ou os servicos gerenciados equivalentes. MongoDB e Graylog do Compose nao
   devem ser levados para producao sem uma decisao explicita de servico gerenciado.
3. Criar os segredos no AWS Secrets Manager (`POSTGRES_PASSWORD`, `JWT_SECRET` e demais
   URLs) e conceder ao task execution role apenas acesso aos segredos necessarios. As
   variaveis nao sensiveis podem ficar na configuracao da task.
4. Criar um Dockerfile de producao em multi-stage, publicar a imagem no ECR e definir uma
   task definition Fargate com CPU/memoria, porta `3000`, log driver `awslogs`, health
   check HTTP e execution/task roles separados.
5. Executar migrations como etapa controlada de deploy, usando uma task ECS one-off com a
   mesma imagem e os mesmos segredos. Nao habilitar `synchronize` no TypeORM.
6. Criar o ECS Service atras do ALB, configurar target group na porta `3000`, autoscaling
   por CPU/memoria ou requests e deployment circuit breaker com rollback automatico.
7. Configurar CloudWatch Logs, alarmes para erros/latencia/saude da task, backups e
   encryption do RDS, alem de um dominio HTTPS via ACM. O pipeline deve executar build,
   testes, push no ECR, migration controlada e atualizacao do service.

Variaveis essenciais no ambiente Fargate: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`,
`POSTGRES_DB`, `JWT_SECRET` e `JWT_EXPIRES_IN`. As conexoes opcionais de Redis, RabbitMQ,
MongoDB e Graylog so devem ser configuradas quando os servicos correspondentes estiverem
disponiveis na VPC. Como proxima entrega pratica, crie o Dockerfile, a task definition e a
infraestrutura como codigo (CDK, Terraform ou CloudFormation), valide a imagem localmente
e depois promova para um ambiente AWS de homologacao.

## Documentacao consolidada

## Regra de documentacao de alteracoes

Toda alteracao no sistema deve ser documentada neste arquivo durante a mesma entrega.
Ao modificar funcionalidades, endpoints, regras de negocio, banco de dados, contratos,
configuracoes ou testes, atualize as secoes correspondentes do `PROJECT_SUMMARY.md`.
Quando a alteracao criar um novo componente ou fluxo, inclua tambem uma descricao do
proposito, comportamento esperado, impacto para o frontend e comandos de validacao,
quando aplicavel.

### Correcao de inicializacao TypeORM

A coluna `members.email` aceita `NULL` para permitir membros sem usuario do sistema.
Como o TypeScript representa esse campo como `string | null`, o tipo PostgreSQL foi
declarado explicitamente como `varchar` na entidade TypeORM. Sem essa declaracao, o
TypeORM inferia o tipo como `Object`, impedia a inicializacao da conexao e fazia a API
recusar conexoes na porta `3001`.

Este arquivo substitui os documentos redundantes da raiz:

- `QUICK_START.md`, `COMPLETE_SETUP.md` e `MICROSERVICES_SETUP.md`: setup, arquitetura, Docker e comandos.
- `RBAC_IMPLEMENTATION.md` e `RBAC_EXAMPLES.md`: hierarquia, regras e cenarios de autorizacao.
- `USERS_CRUD_DOCUMENTATION.md` e `TEST_CRUD_EXAMPLES.md`: endpoints CRUD e exemplos de teste manual.
- `CRUD_IMPLEMENTATION_SUMMARY.md` e `IMPLEMENTATION_CHECKLIST.md`: inventario e checklist da implementacao.
- `README.md`: README padrao do NestJS, sem informacoes especificas do servico.
- `code-review-report.md`, `CODE_REVIEWER_AGENT_SUMMARY.md`: relatorios historicos de code review, sem instrucoes necessarias para executar a aplicacao.

A documentacao operacional dos agentes em `.kiro/agents/*.md` foi mantida porque pertence ao tooling de code review, nao ao funcionamento da API.
