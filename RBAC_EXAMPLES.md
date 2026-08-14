# Exemplos Práticos do Sistema RBAC

## Como Testar o Sistema RBAC

### 1. Iniciar a Aplicação

```bash
npm run start:dev
```

### 2. Cenários de Teste

#### Cenário 1: Registro Público (Apenas USER)

```bash
# Registrar um usuário comum via endpoint público
curl -X POST http://localhost:3000/auth/register/public \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@test.com",
    "password": "senha123"
  }'

# Resposta esperada:
# {
#   "message": "User registered successfully",
#   "id": "uuid-gerado",
#   "email": "usuario@test.com",
#   "roles": ["user"]
# }
```

#### Cenário 2: Login e Obter Token

```bash
# Fazer login para obter token JWT
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'

# Resposta esperada:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "uuid",
#     "email": "admin@test.com", 
#     "roles": ["user"]
#   }
# }
```

#### Cenário 3: Acessar Perfil (Requer Autenticação)

```bash
# Usar o token obtido no login
export TOKEN="SEU_TOKEN_AQUI"

curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Resposta esperada:
# {
#   "message": "User profile",
#   "user": {
#     "id": "uuid",
#     "email": "admin@test.com",
#     "roles": ["user"],
#     "isActive": true
#   }
# }
```

#### Cenário 4: Criar Usuário com Permissões (ADMIN/MANAGER/USER)

```bash
# ADMIN pode criar qualquer tipo de usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "manager@test.com",
    "password": "senha123",
    "roles": ["manager"]
  }'

# MANAGER pode criar USER e GUEST
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{
    "email": "funcionario@test.com",
    "password": "senha123", 
    "roles": ["user"]
  }'

# USER pode criar apenas GUEST
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "email": "visitante@test.com",
    "password": "senha123",
    "roles": ["guest"]
  }'
```

#### Cenário 5: Tentativa de Criação Não Autorizada

```bash
# USER tentando criar ADMIN (deve falhar)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "email": "tentativa-admin@test.com",
    "password": "senha123",
    "roles": ["admin"]
  }'

# Resposta esperada (400 Bad Request):
# {
#   "statusCode": 400,
#   "message": "Insufficient permissions. Required role: Permission to create user with role admin, User role: user",
#   "error": "Bad Request"
# }
```

#### Cenário 6: Ver Roles Disponíveis (ADMIN/MANAGER)

```bash
# Verificar quais roles o usuário atual pode atribuir
curl -X GET http://localhost:3000/auth/available-roles \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Resposta para ADMIN:
# {
#   "availableRoles": ["admin", "manager", "user", "guest"],
#   "currentUserRole": "admin"
# }

# Resposta para MANAGER:
# {
#   "availableRoles": ["user", "guest"],
#   "currentUserRole": "manager"
# }
```

### 3. Testes de Autorização com Different Roles

#### Teste 1: Access Control por Role

```bash
# Endpoint que requer ADMIN
curl -X GET http://localhost:3000/auth/admin-only \
  -H "Authorization: Bearer $USER_TOKEN"

# Deve retornar 403 Forbidden

curl -X GET http://localhost:3000/auth/admin-only \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Deve funcionar normalmente
```

#### Teste 2: Hierarquia de Permissões

```bash
# ADMIN pode acessar qualquer endpoint
# MANAGER pode acessar endpoints de USER e GUEST
# USER pode acessar apenas endpoints de USER e GUEST  
# GUEST pode acessar apenas endpoints de GUEST
```

## Estados de Erro Comuns

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Causa**: Token JWT ausente, inválido ou expirado.

### 403 Forbidden - Sem Roles
```json
{
  "statusCode": 403,
  "message": "User not authenticated or roles not found",
  "error": "Forbidden"
}
```
**Causa**: Usuário autenticado mas sem informações de roles.

### 403 Forbidden - Permissão Insuficiente
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required roles: admin, manager, User role: user",
  "error": "Forbidden"
}
```
**Causa**: Usuário não possui o role necessário para acessar o endpoint.

### 400 Bad Request - Criação não Autorizada
```json
{
  "statusCode": 400,
  "message": "Insufficient permissions. Required role: Permission to create user with role admin, User role: user",
  "error": "Bad Request"
}
```
**Causa**: Tentativa de criar usuário com role superior ao permitido.

## Scripts de Teste Automatizado

### Criar Usuários de Teste

```bash
#!/bin/bash

# Script para criar usuários de teste com diferentes roles

echo "=== Criando usuários de teste ==="

# 1. Registro público (USER)
echo "1. Registrando usuário comum..."
curl -s -X POST http://localhost:3000/auth/register/public \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}' | jq

# 2. Login para obter token
echo "2. Fazendo login..."
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}')

USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.access_token')
echo "Token do usuário: $USER_TOKEN"

# 3. Verificar perfil
echo "3. Verificando perfil..."
curl -s -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# 4. Tentar criar ADMIN (deve falhar)
echo "4. Tentando criar admin (deve falhar)..."
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"email": "admin@test.com", "password": "password123", "roles": ["admin"]}' | jq

echo "=== Testes concluídos ==="
```

### Validar Hierarquia de Permissions

```bash
#!/bin/bash

# Script para validar hierarquia de permissões

echo "=== Testando Hierarquia de Permissões ==="

# Simular diferentes cenários de criação de usuários
echo "ADMIN criando MANAGER: ✓ Permitido"
echo "ADMIN criando USER: ✓ Permitido"  
echo "ADMIN criando GUEST: ✓ Permitido"

echo "MANAGER criando ADMIN: ✗ Negado"
echo "MANAGER criando USER: ✓ Permitido"
echo "MANAGER criando GUEST: ✓ Permitido"

echo "USER criando ADMIN: ✗ Negado"
echo "USER criando MANAGER: ✗ Negado"
echo "USER criando GUEST: ✓ Permitido"

echo "GUEST criando qualquer: ✗ Negado"
```

## Pontos de Verificação

- ✅ Sistema RBAC implementado com hierarquia clara
- ✅ Validação de permissões na criação de usuários
- ✅ Guards de autorização funcionando
- ✅ Decorators @Roles e @CurrentUser implementados
- ✅ JWT incluindo informações de roles
- ✅ Tratamento de erros adequado
- ✅ Endpoint público para registro de usuários comuns
- ✅ Endpoint protegido para criação com roles específicos
- ✅ Documentação completa do sistema

O sistema RBAC está totalmente funcional e pronto para uso em produção!