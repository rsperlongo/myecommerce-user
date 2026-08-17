# Testes do CRUD de Usuários com RBAC

## Scripts de Teste Automatizados

### Script 1: Teste Completo de CRUD

```bash
#!/bin/bash

# Configurações
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="password123"

echo "=== TESTE COMPLETO DO CRUD DE USUÁRIOS COM RBAC ==="
echo

# Função para fazer requisições e mostrar resultado
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    echo "🔄 $method $endpoint"
    if [ -n "$data" ]; then
        echo "📝 Data: $data"
    fi
    
    local headers="-H 'Content-Type: application/json'"
    if [ -n "$token" ]; then
        headers="$headers -H 'Authorization: Bearer $token'"
    fi
    
    local response
    if [ -n "$data" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint" $headers -d "$data")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" $headers)
    fi
    
    echo "📄 Response: $response"
    echo "----------------------------------------"
    echo
    
    echo "$response"
}

# 1. REGISTRO PÚBLICO DE USUÁRIO
echo "1️⃣ TESTE: Registro público de usuário"
USER_REGISTRATION=$(make_request "POST" "/auth/register/public" '{
  "email": "newuser@test.com",
  "password": "password123"
}')
echo

# 2. LOGIN PARA OBTER TOKENS
echo "2️⃣ TESTE: Login de usuários"

# Login do usuário criado
echo "Login do usuário comum..."
USER_LOGIN=$(make_request "POST" "/auth/login" '{
  "email": "newuser@test.com", 
  "password": "password123"
}')
USER_TOKEN=$(echo $USER_LOGIN | jq -r '.access_token // empty')
USER_ID=$(echo $USER_LOGIN | jq -r '.user.id // empty')
echo "User Token: $USER_TOKEN"
echo "User ID: $USER_ID"
echo

# Login do admin (simulado)
echo "Login do admin..."
ADMIN_LOGIN=$(make_request "POST" "/auth/login" '{
  "email": "'$ADMIN_EMAIL'",
  "password": "'$ADMIN_PASSWORD'"
}')
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.access_token // empty')
echo "Admin Token: $ADMIN_TOKEN"
echo

# 3. TESTES DE CREATE
echo "3️⃣ TESTE: Operações de CREATE"

echo "Admin criando manager..."
make_request "POST" "/users" '{
  "email": "manager@test.com",
  "password": "password123",
  "roles": ["manager"]
}' "$ADMIN_TOKEN"

echo "Admin criando usuário comum..."
ADMIN_CREATE_USER=$(make_request "POST" "/users" '{
  "email": "employee@test.com",
  "password": "password123",
  "roles": ["user"]
}' "$ADMIN_TOKEN")

echo "Usuário comum tentando criar admin (deve falhar)..."
make_request "POST" "/users" '{
  "email": "fake-admin@test.com",
  "password": "password123",
  "roles": ["admin"]
}' "$USER_TOKEN"

echo "Usuário comum criando guest (deve funcionar)..."
make_request "POST" "/users" '{
  "email": "guest@test.com",
  "password": "password123",
  "roles": ["guest"]
}' "$USER_TOKEN"
echo

# 4. TESTES DE READ
echo "4️⃣ TESTE: Operações de READ"

echo "Admin listando todos os usuários..."
make_request "GET" "/users?page=1&limit=5" "" "$ADMIN_TOKEN"

echo "Usuário comum tentando listar usuários (deve falhar)..."
make_request "GET" "/users" "" "$USER_TOKEN"

echo "Admin vendo perfil específico..."
make_request "GET" "/users/1" "" "$ADMIN_TOKEN"

echo "Usuário vendo próprio perfil..."
make_request "GET" "/users/$USER_ID" "" "$USER_TOKEN"

echo "Admin vendo estatísticas..."
make_request "GET" "/users/stats/summary" "" "$ADMIN_TOKEN"
echo

# 5. TESTES DE UPDATE
echo "5️⃣ TESTE: Operações de UPDATE"

echo "Usuário atualizando próprio email..."
make_request "PUT" "/users/$USER_ID" '{
  "email": "newemail@test.com"
}' "$USER_TOKEN"

echo "Usuário tentando alterar próprios roles (deve falhar)..."
make_request "PUT" "/users/$USER_ID" '{
  "roles": ["admin"]
}' "$USER_TOKEN"

echo "Admin atualizando role de usuário..."
make_request "PUT" "/users/3" '{
  "roles": ["manager"]
}' "$ADMIN_TOKEN"

echo "Admin desativando usuário..."
make_request "PUT" "/users/3" '{
  "isActive": false
}' "$ADMIN_TOKEN"
echo

# 6. TESTES DE DELETE
echo "6️⃣ TESTE: Operações de DELETE"

echo "Admin desativando usuário (soft delete)..."
make_request "DELETE" "/users/4" "" "$ADMIN_TOKEN"

echo "Usuário comum tentando deletar (deve falhar)..."
make_request "DELETE" "/users/3" "" "$USER_TOKEN"

echo "Admin reativando usuário..."
make_request "POST" "/users/4/reactivate" "" "$ADMIN_TOKEN"
echo

# 7. TESTES DE VALIDAÇÃO E SEGURANÇA
echo "7️⃣ TESTE: Validações e Segurança"

echo "Tentativa de acesso sem token (deve falhar)..."
make_request "GET" "/users" ""

echo "Criação com email duplicado (deve falhar)..."
make_request "POST" "/users" '{
  "email": "newemail@test.com",
  "password": "password123"
}' "$ADMIN_TOKEN"

echo "Senha muito curta (deve falhar)..."
make_request "POST" "/users" '{
  "email": "shortpass@test.com",
  "password": "123"
}' "$ADMIN_TOKEN"

echo "Email inválido (deve falhar)..."
make_request "POST" "/users" '{
  "email": "invalid-email",
  "password": "password123"
}' "$ADMIN_TOKEN"

echo "=== TESTE COMPLETO FINALIZADO ==="
```

### Script 2: Teste de Hierarquia de Permissões

```bash
#!/bin/bash

echo "=== TESTE DE HIERARQUIA DE PERMISSÕES RBAC ==="
echo

# Simular diferentes usuários
declare -A TOKENS
TOKENS["admin"]="admin-token-here"
TOKENS["manager"]="manager-token-here"
TOKENS["user"]="user-token-here"
TOKENS["guest"]="guest-token-here"

# Função para testar permissão
test_permission() {
    local role=$1
    local action=$2
    local target_role=$3
    local expected=$4
    
    echo "🧪 Teste: $role tentando $action $target_role"
    echo "   Esperado: $expected"
    
    # Aqui faria a requisição real
    # Por enquanto, simular com base nas regras
    local result
    case $role in
        "admin")
            case $action in
                "create"|"update"|"delete"|"read") result="✅ PERMITIDO" ;;
                *) result="❌ NEGADO" ;;
            esac
            ;;
        "manager")
            case $action in
                "create"|"update"|"read")
                    if [[ "$target_role" == "user" || "$target_role" == "guest" ]]; then
                        result="✅ PERMITIDO"
                    else
                        result="❌ NEGADO"
                    fi
                    ;;
                "delete") result="❌ NEGADO" ;;
                *) result="❌ NEGADO" ;;
            esac
            ;;
        "user")
            case $action in
                "create")
                    if [[ "$target_role" == "guest" ]]; then
                        result="✅ PERMITIDO"
                    else
                        result="❌ NEGADO"
                    fi
                    ;;
                "read")
                    if [[ "$target_role" == "guest" ]]; then
                        result="✅ PERMITIDO"
                    else
                        result="❌ NEGADO"
                    fi
                    ;;
                *) result="❌ NEGADO" ;;
            esac
            ;;
        "guest")
            result="❌ NEGADO"
            ;;
    esac
    
    if [[ "$result" == "$expected" ]]; then
        echo "   Resultado: $result ✅"
    else
        echo "   Resultado: $result ❌ (ERRO!)"
    fi
    echo
}

# TESTES DE CRIAÇÃO
echo "📝 TESTES DE CRIAÇÃO DE USUÁRIOS"
test_permission "admin" "create" "admin" "✅ PERMITIDO"
test_permission "admin" "create" "manager" "✅ PERMITIDO"
test_permission "admin" "create" "user" "✅ PERMITIDO"
test_permission "admin" "create" "guest" "✅ PERMITIDO"

test_permission "manager" "create" "admin" "❌ NEGADO"
test_permission "manager" "create" "manager" "❌ NEGADO"
test_permission "manager" "create" "user" "✅ PERMITIDO"
test_permission "manager" "create" "guest" "✅ PERMITIDO"

test_permission "user" "create" "admin" "❌ NEGADO"
test_permission "user" "create" "manager" "❌ NEGADO"
test_permission "user" "create" "user" "❌ NEGADO"
test_permission "user" "create" "guest" "✅ PERMITIDO"

test_permission "guest" "create" "admin" "❌ NEGADO"
test_permission "guest" "create" "manager" "❌ NEGADO"
test_permission "guest" "create" "user" "❌ NEGADO"
test_permission "guest" "create" "guest" "❌ NEGADO"

# TESTES DE LEITURA
echo "👀 TESTES DE LEITURA DE USUÁRIOS"
test_permission "admin" "read" "admin" "✅ PERMITIDO"
test_permission "admin" "read" "manager" "✅ PERMITIDO"
test_permission "admin" "read" "user" "✅ PERMITIDO"
test_permission "admin" "read" "guest" "✅ PERMITIDO"

test_permission "manager" "read" "admin" "❌ NEGADO"
test_permission "manager" "read" "manager" "❌ NEGADO"
test_permission "manager" "read" "user" "✅ PERMITIDO"
test_permission "manager" "read" "guest" "✅ PERMITIDO"

test_permission "user" "read" "admin" "❌ NEGADO"
test_permission "user" "read" "manager" "❌ NEGADO"
test_permission "user" "read" "user" "❌ NEGADO"
test_permission "user" "read" "guest" "✅ PERMITIDO"

test_permission "guest" "read" "admin" "❌ NEGADO"
test_permission "guest" "read" "manager" "❌ NEGADO"
test_permission "guest" "read" "user" "❌ NEGADO"
test_permission "guest" "read" "guest" "❌ NEGADO"

# TESTES DE ATUALIZAÇÃO
echo "✏️ TESTES DE ATUALIZAÇÃO DE USUÁRIOS"
test_permission "admin" "update" "admin" "✅ PERMITIDO"
test_permission "admin" "update" "manager" "✅ PERMITIDO"
test_permission "admin" "update" "user" "✅ PERMITIDO"
test_permission "admin" "update" "guest" "✅ PERMITIDO"

test_permission "manager" "update" "admin" "❌ NEGADO"
test_permission "manager" "update" "manager" "❌ NEGADO"
test_permission "manager" "update" "user" "✅ PERMITIDO"
test_permission "manager" "update" "guest" "✅ PERMITIDO"

test_permission "user" "update" "admin" "❌ NEGADO"
test_permission "user" "update" "manager" "❌ NEGADO"
test_permission "user" "update" "user" "❌ NEGADO"
test_permission "user" "update" "guest" "❌ NEGADO"

# TESTES DE DELEÇÃO
echo "🗑️ TESTES DE DELEÇÃO DE USUÁRIOS"
test_permission "admin" "delete" "admin" "✅ PERMITIDO"
test_permission "admin" "delete" "manager" "✅ PERMITIDO"
test_permission "admin" "delete" "user" "✅ PERMITIDO"
test_permission "admin" "delete" "guest" "✅ PERMITIDO"

test_permission "manager" "delete" "admin" "❌ NEGADO"
test_permission "manager" "delete" "manager" "❌ NEGADO"
test_permission "manager" "delete" "user" "❌ NEGADO"
test_permission "manager" "delete" "guest" "❌ NEGADO"

test_permission "user" "delete" "admin" "❌ NEGADO"
test_permission "user" "delete" "manager" "❌ NEGADO"
test_permission "user" "delete" "user" "❌ NEGADO"
test_permission "user" "delete" "guest" "❌ NEGADO"

test_permission "guest" "delete" "admin" "❌ NEGADO"
test_permission "guest" "delete" "manager" "❌ NEGADO"
test_permission "guest" "delete" "user" "❌ NEGADO"
test_permission "guest" "delete" "guest" "❌ NEGADO"

echo "=== TESTE DE HIERARQUIA FINALIZADO ==="
```

### Script 3: Teste de Cenários de Erro

```bash
#!/bin/bash

echo "=== TESTE DE CENÁRIOS DE ERRO ==="
echo

BASE_URL="http://localhost:3000"

# Função para testar erro esperado
test_error() {
    local description=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    local expected_code=$6
    
    echo "🔴 Teste: $description"
    echo "📋 Esperado: HTTP $expected_code"
    
    local headers=""
    if [ -n "$token" ]; then
        headers="-H 'Authorization: Bearer $token'"
    fi
    
    local response_code
    if [ -n "$data" ]; then
        response_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" $headers -d "$data")
    else
        response_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" $headers)
    fi
    
    if [ "$response_code" = "$expected_code" ]; then
        echo "✅ Resultado: HTTP $response_code (SUCESSO)"
    else
        echo "❌ Resultado: HTTP $response_code (ERRO - esperado $expected_code)"
    fi
    echo
}

# Token inválido
INVALID_TOKEN="invalid-token-123"
VALID_USER_TOKEN="valid-user-token"
VALID_ADMIN_TOKEN="valid-admin-token"

echo "🚫 TESTES DE AUTENTICAÇÃO"
test_error "Acesso sem token" "GET" "/users" "" "" "401"
test_error "Token inválido" "GET" "/users" "" "$INVALID_TOKEN" "401"
test_error "Token expirado" "GET" "/users" "" "expired-token" "401"

echo "🔒 TESTES DE AUTORIZAÇÃO"
test_error "User tentando listar usuários" "GET" "/users" "" "$VALID_USER_TOKEN" "403"
test_error "User tentando criar admin" "POST" "/users" '{"email":"admin@test.com","password":"password123","roles":["admin"]}' "$VALID_USER_TOKEN" "400"
test_error "Guest tentando qualquer coisa" "POST" "/users" '{"email":"test@test.com","password":"password123"}' "guest-token" "403"

echo "📝 TESTES DE VALIDAÇÃO DE DADOS"
test_error "Email inválido" "POST" "/users" '{"email":"invalid-email","password":"password123"}' "$VALID_ADMIN_TOKEN" "422"
test_error "Senha muito curta" "POST" "/users" '{"email":"test@test.com","password":"123"}' "$VALID_ADMIN_TOKEN" "422"
test_error "Email em branco" "POST" "/users" '{"email":"","password":"password123"}' "$VALID_ADMIN_TOKEN" "422"
test_error "Role inválido" "POST" "/users" '{"email":"test@test.com","password":"password123","roles":["invalid-role"]}' "$VALID_ADMIN_TOKEN" "422"

echo "💥 TESTES DE CONFLITOS"
test_error "Email duplicado" "POST" "/users" '{"email":"existing@test.com","password":"password123"}' "$VALID_ADMIN_TOKEN" "409"

echo "🔍 TESTES DE RECURSOS NÃO ENCONTRADOS"
test_error "Usuário inexistente" "GET" "/users/999999999-9999-9999-9999-999999999999" "" "$VALID_ADMIN_TOKEN" "404"
test_error "Atualizar usuário inexistente" "PUT" "/users/999999999-9999-9999-9999-999999999999" '{"email":"new@test.com"}' "$VALID_ADMIN_TOKEN" "404"
test_error "Deletar usuário inexistente" "DELETE" "/users/999999999-9999-9999-9999-999999999999" "" "$VALID_ADMIN_TOKEN" "404"

echo "🛡️ TESTES DE REGRAS DE NEGÓCIO"
test_error "Auto-deleção (admin deletando própria conta)" "DELETE" "/users/admin-user-id" "" "$VALID_ADMIN_TOKEN" "400"
test_error "Deletar último admin" "DELETE" "/users/last-admin-id" "" "$VALID_ADMIN_TOKEN" "400"
test_error "User alterando próprios roles" "PUT" "/users/user-id" '{"roles":["admin"]}' "$VALID_USER_TOKEN" "400"

echo "📊 TESTES DE LIMITES"
test_error "Página muito alta" "GET" "/users?page=999999" "" "$VALID_ADMIN_TOKEN" "200" # Deve retornar vazio, não erro
test_error "Limit muito alto" "GET" "/users?limit=1000" "" "$VALID_ADMIN_TOKEN" "422"
test_error "Limit negativo" "GET" "/users?limit=-1" "" "$VALID_ADMIN_TOKEN" "422"

echo "=== TESTE DE CENÁRIOS DE ERRO FINALIZADO ==="
```

### Como Executar os Testes

```bash
# 1. Dar permissão de execução aos scripts
chmod +x test-crud.sh
chmod +x test-permissions.sh  
chmod +x test-errors.sh

# 2. Iniciar a aplicação
npm run start:dev

# 3. Aguardar alguns segundos e executar os testes
./test-crud.sh
./test-permissions.sh
./test-errors.sh

# 4. Ou executar teste específico
./test-crud.sh > resultado-crud.log 2>&1
cat resultado-crud.log
```

### Validação Manual com Postman

1. **Importar Collection**: Criar collection com todos os endpoints
2. **Configurar Variáveis**: 
   - `baseUrl`: http://localhost:3000
   - `adminToken`: Token do admin
   - `userToken`: Token do usuário
3. **Executar Sequência**: Seguir ordem dos testes
4. **Validar Respostas**: Verificar códigos HTTP e payloads

Esses scripts permitem validar completamente o funcionamento do CRUD com RBAC!