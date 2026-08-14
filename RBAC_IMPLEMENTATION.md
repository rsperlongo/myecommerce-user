# Sistema RBAC - Controle de Acesso Baseado em Roles

## Visão Geral

Este documento descreve a implementação do sistema RBAC (Role-Based Access Control) na aplicação MyCommerce User Service.

## Estrutura de Roles

### Hierarquia de Roles

O sistema implementa uma hierarquia de roles com os seguintes níveis:

```
ADMIN (Nível mais alto)
├── MANAGER
├── USER  
└── GUEST (Nível mais baixo)
```

### Definição dos Roles

- **ADMIN**: Acesso total ao sistema, pode criar usuários com qualquer role
- **MANAGER**: Pode gerenciar usuários comuns, criar USER e GUEST
- **USER**: Usuário padrão, pode criar apenas GUEST
- **GUEST**: Acesso limitado, não pode criar outros usuários

## Regras de Negócio para Criação de Usuários

### Matriz de Permissões

| Role do Criador | Pode Criar |
|-----------------|------------|
| ADMIN          | ADMIN, MANAGER, USER, GUEST |
| MANAGER        | USER, GUEST |
| USER           | GUEST |
| GUEST          | Nenhum |

### Validações Implementadas

1. **Verificação de Permissão**: Antes de criar um usuário, o sistema verifica se o usuário atual tem permissão para atribuir os roles solicitados
2. **Email Único**: Garante que não existam usuários duplicados com o mesmo email
3. **Role Padrão**: Se nenhum role for especificado, o usuário é criado com role USER
4. **Usuário Ativo**: Novos usuários são criados como ativos por padrão

## Endpoints da API

### POST /auth/register
Criar usuário (requer autenticação)

**Permissões necessárias**: ADMIN, MANAGER ou USER
**Headers**: `Authorization: Bearer <token>`

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "roles": ["USER"] // Opcional, padrão é ["USER"]
}
```

**Resposta**:
```json
{
  "message": "User registered successfully",
  "id": "uuid",
  "email": "usuario@exemplo.com", 
  "roles": ["USER"],
  "createdBy": "criador@exemplo.com"
}
```

### POST /auth/register/public
Registro público (sem autenticação)

**Permissões**: Nenhuma (endpoint público)
**Limitação**: Só pode criar usuários com role USER

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### GET /auth/available-roles
Listar roles disponíveis para o usuário atual

**Permissões necessárias**: ADMIN ou MANAGER
**Headers**: `Authorization: Bearer <token>`

**Resposta**:
```json
{
  "availableRoles": ["USER", "GUEST"],
  "currentUserRole": "MANAGER"
}
```

### POST /auth/login
Login de usuário

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta**:
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "roles": ["USER"]
  }
}
```

### GET /auth/profile
Obter perfil do usuário autenticado

**Headers**: `Authorization: Bearer <token>`

## Implementação Técnica

### Estrutura dos Arquivos

```
src/
├── domain/
│   ├── enums/user-role.enum.ts          # Definição dos roles e hierarquia
│   ├── entities/user.entity.ts          # Entidade de domínio com métodos de role
│   └── exceptions/                      # Exceções customizadas
├── application/
│   └── use-cases/create-user-with-roles.usecase.ts  # Lógica de negócio para criação
└── modules/auth/
    ├── decorators/                      # Decorators @Roles e @CurrentUser
    ├── guards/roles.guard.ts           # Guard para validação de permissões
    ├── controllers/auth.controller.ts   # Endpoints da API
    └── services/auth.service.ts        # Serviços de autenticação
```

### Componentes Principais

#### 1. UserRole Enum
```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  USER = 'user',
  GUEST = 'guest'
}
```

#### 2. RolesGuard
Guard que valida se o usuário tem as permissões necessárias para acessar um endpoint.

#### 3. @Roles Decorator
Decorator usado para marcar endpoints com os roles necessários:
```typescript
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Get('admin-only-endpoint')
```

#### 4. @CurrentUser Decorator  
Extrai o usuário atual do contexto da requisição:
```typescript
async createUser(@CurrentUser() user: UserEntity) {
  // usar informações do usuário atual
}
```

#### 5. CreateUserWithRolesUseCase
Use case que implementa a lógica de negócio para criação de usuários com validação de permissões.

## Uso nos Controllers

### Protegendo Endpoints
```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Post('admin-only')
adminOnlyEndpoint(@CurrentUser() user: UserEntity) {
  // Apenas ADMINs podem acessar
}
```

### Verificações Condicionais
```typescript
@UseGuards(AuthGuard('jwt'))
@Get('conditional')
conditionalEndpoint(@CurrentUser() user: UserEntity) {
  if (user.hasRole(UserRole.ADMIN)) {
    // Lógica para admin
  } else if (user.hasAnyRole([UserRole.MANAGER, UserRole.USER])) {
    // Lógica para manager ou user
  }
}
```

## Tratamento de Erros

### Erros Comuns

1. **403 Forbidden**: Usuário não tem permissão suficiente
2. **400 Bad Request**: Tentativa de criar usuário com role não permitido
3. **401 Unauthorized**: Token JWT inválido ou ausente

### Exemplo de Erro
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required roles: admin, User role: user",
  "error": "Forbidden"
}
```

## Considerações de Segurança

1. **JWT com Roles**: O token JWT inclui informações de roles para validação
2. **Validação Dupla**: Permissões são validadas tanto no guard quanto no use case
3. **Princípio do Menor Privilégio**: Usuários só podem criar usuários com níveis inferiores
4. **Auditoria**: Sistema registra quem criou cada usuário

## Próximos Passos

- [ ] Implementar repositório real do usuário (substituir mock)
- [ ] Adicionar validação de login real  
- [ ] Implementar endpoint para alterar roles de usuários existentes
- [ ] Adicionar logs de auditoria para ações administrativas
- [ ] Criar testes unitários e de integração
- [ ] Documentar API com Swagger/OpenAPI

## Exemplos de Teste

### Teste com cURL

```bash
# 1. Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password"}'

# 2. Criar usuário (usar token do login)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"email": "newuser@test.com", "password": "password123", "roles": ["USER"]}'

# 3. Verificar roles disponíveis
curl -X GET http://localhost:3000/auth/available-roles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Este sistema RBAC fornece uma base sólida para controle de acesso na aplicação, seguindo as melhores práticas de segurança e arquitetura limpa.