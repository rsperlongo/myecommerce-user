# CRUD de Usuários com RBAC

## Visão Geral

Este documento descreve as operações CRUD (Create, Read, Update, Delete) para usuários, implementadas respeitando todas as regras de negócio do sistema RBAC.

## Endpoints Disponíveis

### Base URL
```
http://localhost:3000/users
```

### Autenticação Necessária
Todos os endpoints requerem header de autorização:
```
Authorization: Bearer <jwt-token>
```

---

## 📝 CREATE - Criar Usuário

### `POST /users`

**Permissões:** ADMIN, MANAGER, USER (com restrições por role)

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "email": "novousuario@exemplo.com",
  "password": "senha123456",
  "roles": ["user"] // Opcional, padrão é ["user"]
}
```

**Regras de Negócio:**
- **ADMIN** pode criar: ADMIN, MANAGER, USER, GUEST
- **MANAGER** pode criar: USER, GUEST  
- **USER** pode criar: GUEST
- **GUEST** não pode criar usuários

**Resposta de Sucesso (201):**
```json
{
  "message": "User created successfully",
  "data": {
    "id": "uuid-gerado",
    "email": "novousuario@exemplo.com",
    "roles": ["user"],
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "createdBy": "criador@exemplo.com"
}
```

**Erros Possíveis:**
- `400 Bad Request`: Permissão insuficiente ou email já existe
- `401 Unauthorized`: Token inválido
- `422 Unprocessable Entity`: Dados inválidos

---

## 📖 READ - Operações de Leitura

### `GET /users` - Listar Usuários

**Permissões:** ADMIN (todos usuários), MANAGER (apenas USER e GUEST)

**Query Parameters:**
```
?page=1              // Número da página (padrão: 1)
&limit=10            // Itens por página (padrão: 10, máx: 100)
&search=texto        // Busca por email
&roles=user,guest    // Filtrar por roles (separados por vírgula)
&isActive=true       // Filtrar por status ativo
&sortBy=createdAt    // Campo para ordenação (email, createdAt, updatedAt)
&sortOrder=DESC      // Ordem (ASC, DESC)
```

**Exemplo:**
```bash
GET /users?page=1&limit=10&roles=user&isActive=true&search=@exemplo.com
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "email": "usuario1@exemplo.com",
      "roles": ["user"],
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "email": "usuario2@exemplo.com",
      "roles": ["guest"],
      "isActive": false,
      "createdAt": "2024-01-14T09:30:00.000Z",
      "updatedAt": "2024-01-14T09:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### `GET /users/:id` - Obter Usuário por ID

**Permissões:** 
- **ADMIN**: Todos usuários
- **MANAGER**: USER e GUEST
- **USER**: GUEST + próprio perfil
- **Qualquer role**: Próprio perfil

**Resposta de Sucesso (200):**
```json
{
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "roles": ["user"],
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Erros Possíveis:**
- `404 Not Found`: Usuário não encontrado
- `400 Bad Request`: Permissão insuficiente

### `GET /users/stats/summary` - Estatísticas de Usuários

**Permissões:** ADMIN, MANAGER

**Resposta para ADMIN:**
```json
{
  "message": "User statistics retrieved successfully",
  "data": {
    "total": 15,
    "active": 12,
    "inactive": 3,
    "byRole": {
      "admin": 2,
      "manager": 3,
      "user": 8,
      "guest": 2
    },
    "recentRegistrations": 5
  }
}
```

**Resposta para MANAGER (apenas USER e GUEST):**
```json
{
  "message": "User statistics retrieved successfully",
  "data": {
    "total": 10,
    "active": 8,
    "inactive": 2,
    "byRole": {
      "user": 8,
      "guest": 2
    },
    "recentRegistrations": 3
  }
}
```

---

## ✏️ UPDATE - Atualizar Usuário

### `PUT /users/:id`

**Permissões:**
- **ADMIN**: Pode atualizar qualquer usuário
- **MANAGER**: Pode atualizar USER e GUEST
- **Qualquer role**: Próprio perfil (exceto roles)

**Body (todos campos opcionais):**
```json
{
  "email": "novoemail@exemplo.com",
  "password": "novasenha123",
  "roles": ["manager"],      // Apenas usuários com permissão podem alterar
  "isActive": false
}
```

**Regras Especiais:**
- Usuários **não podem alterar os próprios roles**
- Para alterar roles, deve ter permissão para **remover** os roles antigos e **adicionar** os novos
- Email deve ser único no sistema

**Resposta de Sucesso (200):**
```json
{
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "novoemail@exemplo.com",
    "roles": ["manager"],
    "isActive": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "updatedBy": "admin@exemplo.com"
}
```

### `POST /users/:id/reactivate` - Reativar Usuário

**Permissões:** ADMIN apenas

**Resposta de Sucesso (200):**
```json
{
  "message": "User reactivated successfully",
  "data": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "roles": ["user"],
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "reactivatedBy": "admin@exemplo.com"
}
```

---

## 🗑️ DELETE - Desativar Usuário

### `DELETE /users/:id` - Soft Delete (Desativar)

**Permissões:** ADMIN apenas

**Comportamento:**
- **Soft Delete**: Usuário é desativado (isActive = false) mas mantido no sistema
- **Não remove dados**: Preserva histórico e relacionamentos
- **Reversível**: Pode ser reativado com endpoint de reativação

**Validações de Segurança:**
- Não permite auto-exclusão (admin não pode deletar própria conta)
- Verifica se não é o último admin do sistema
- Valida dependências (pedidos, transações, etc.)

**Resposta de Sucesso (200):**
```json
{
  "message": "User deactivated successfully",
  "data": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "roles": ["user"],
    "isActive": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:15:00.000Z"
  },
  "deletedBy": "admin@exemplo.com"
}
```

**Erros Possíveis:**
- `400 Bad Request`: Tentativa de auto-exclusão ou último admin
- `400 Bad Request`: Usuário tem dependências críticas

---

## 🔒 Matriz de Permissões Detalhada

| Operação | ADMIN | MANAGER | USER | GUEST |
|----------|-------|---------|------|-------|
| **CREATE** |
| Criar ADMIN | ✅ | ❌ | ❌ | ❌ |
| Criar MANAGER | ✅ | ❌ | ❌ | ❌ |
| Criar USER | ✅ | ✅ | ❌ | ❌ |
| Criar GUEST | ✅ | ✅ | ✅ | ❌ |
| **READ** |
| Listar usuários | ✅ (todos) | ✅ (USER,GUEST) | ❌ | ❌ |
| Ver próprio perfil | ✅ | ✅ | ✅ | ✅ |
| Ver perfil ADMIN | ✅ | ❌ | ❌ | ❌ |
| Ver perfil MANAGER | ✅ | ❌ | ❌ | ❌ |
| Ver perfil USER | ✅ | ✅ | ❌ | ❌ |
| Ver perfil GUEST | ✅ | ✅ | ✅ | ❌ |
| Ver estatísticas | ✅ | ✅ | ❌ | ❌ |
| **UPDATE** |
| Alterar próprios dados | ✅ (exceto roles) | ✅ (exceto roles) | ✅ (exceto roles) | ✅ (exceto roles) |
| Alterar roles de outros | ✅ | ✅ (USER,GUEST) | ❌ | ❌ |
| Alterar dados ADMIN | ✅ | ❌ | ❌ | ❌ |
| Alterar dados MANAGER | ✅ | ❌ | ❌ | ❌ |
| Alterar dados USER | ✅ | ✅ | ❌ | ❌ |
| Alterar dados GUEST | ✅ | ✅ | ❌ | ❌ |
| Reativar usuário | ✅ | ❌ | ❌ | ❌ |
| **DELETE** |
| Desativar qualquer | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 Exemplos de Uso Completos

### Cenário 1: Admin Criando e Gerenciando Usuários

```bash
# 1. Login como admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password123"}'

# Salvar o token retornado
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Criar um manager
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "manager@test.com",
    "password": "password123",
    "roles": ["manager"]
  }'

# 3. Listar todos os usuários
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Atualizar um usuário específico
curl -X PUT http://localhost:3000/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "novoemail@test.com",
    "isActive": false
  }'

# 5. Ver estatísticas
curl -X GET http://localhost:3000/users/stats/summary \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 6. Desativar usuário
curl -X DELETE http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 7. Reativar usuário
curl -X POST http://localhost:3000/users/USER_ID/reactivate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Cenário 2: Manager Gerenciando Usuários Comuns

```bash
# 1. Login como manager
export MANAGER_TOKEN="manager_jwt_token"

# 2. Criar usuário comum
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{
    "email": "funcionario@test.com",
    "password": "password123",
    "roles": ["user"]
  }'

# 3. Listar usuários (apenas USER e GUEST)
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# 4. Tentar criar admin (deve falhar)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{
    "email": "tentativa-admin@test.com",
    "password": "password123",
    "roles": ["admin"]
  }'
# Resultado esperado: 400 Bad Request
```

### Cenário 3: Usuário Gerenciando Próprio Perfil

```bash
# 1. Login como usuário comum
export USER_TOKEN="user_jwt_token"

# 2. Ver próprio perfil
curl -X GET http://localhost:3000/users/MEU_USER_ID \
  -H "Authorization: Bearer $USER_TOKEN"

# 3. Atualizar próprio email e senha
curl -X PUT http://localhost:3000/users/MEU_USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "email": "novo-email@test.com",
    "password": "novasenha123"
  }'

# 4. Tentar alterar próprios roles (deve falhar)
curl -X PUT http://localhost:3000/users/MEU_USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "roles": ["admin"]
  }'
# Resultado esperado: 400 Bad Request

# 5. Criar usuário guest
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "email": "visitante@test.com",
    "password": "password123",
    "roles": ["guest"]
  }'
```

---

## 🛡️ Validações e Regras de Segurança

### Validações de Input
- **Email**: Formato válido e único no sistema
- **Password**: Mínimo 6 caracteres
- **Roles**: Array de roles válidos do enum
- **IDs**: Formato UUID válido (quando aplicável)

### Regras de Segurança
- **Não auto-exclusão**: Usuários não podem deletar própria conta
- **Último admin**: Sistema não permite deletar o último admin
- **Dependências**: Verifica relacionamentos antes da exclusão
- **Soft delete**: Preserve dados históricos por padrão
- **Auditoria**: Log de todas as operações sensíveis

### Headers de Segurança
```
Authorization: Bearer <jwt-token>  # Obrigatório
Content-Type: application/json    # Para POST/PUT
```

### Rate Limiting
- Implementar limite de requisições por IP/usuário
- Timeouts apropriados para operações longas

---

## ⚠️ Códigos de Erro Comuns

| Código | Descrição | Causa Comum |
|--------|-----------|-------------|
| 400 | Bad Request | Permissão insuficiente, dados inválidos |
| 401 | Unauthorized | Token ausente/inválido |
| 403 | Forbidden | Role insuficiente |
| 404 | Not Found | Usuário não encontrado |
| 409 | Conflict | Email duplicado |
| 422 | Unprocessable Entity | Validação de dados falhou |
| 500 | Internal Server Error | Erro do servidor |

---

## 🔄 Fluxos de Trabalho Recomendados

### Onboarding de Novo Funcionário
1. **ADMIN** cria conta com role adequado
2. **Sistema** envia email de boas-vindas
3. **Usuário** acessa e atualiza senha
4. **MANAGER** valida acesso aos recursos

### Offboarding de Funcionário
1. **ADMIN** desativa conta (soft delete)
2. **Sistema** revoga tokens ativos
3. **Auditoria** registra a desativação
4. **Dados** permanecem para histórico

### Mudança de Role/Promoção
1. **ADMIN/MANAGER** atualiza roles do usuário
2. **Sistema** invalida tokens existentes
3. **Usuário** faz novo login para obter permissões atualizadas
4. **Auditoria** registra a mudança

Este sistema CRUD garante operações seguras respeitando todas as regras de negócio do RBAC implementado!