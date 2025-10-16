#!/bin/bash

# Script para testar a API da Missão 8
# Execute: chmod +x test-api.sh && ./test-api.sh

echo "🧩 Testando API da Missão 8 - O Mestre dos Dados"
echo "=================================================="

BASE_URL="http://localhost:3000/api/v1"

# Função para fazer requisições
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "📡 $method $endpoint"
    
    if [ -n "$data" ]; then
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" | jq .
    else
        curl -s -X $method "$BASE_URL$endpoint" | jq .
    fi
    
    echo ""
}

# Teste 1: Health Check
echo "🏥 Testando Health Check..."
make_request "GET" "/health"

# Teste 2: Criar produto
echo "➕ Criando produto..."
PRODUCT_DATA='{
    "nome": "Smartphone Teste",
    "descricao": "Celular moderno para testes da API",
    "preco": 1500.99,
    "categoria": "Eletrônicos",
    "estoque": 10
}'

RESPONSE=$(make_request "POST" "/produtos" "$PRODUCT_DATA")
PRODUCT_ID=$(echo $RESPONSE | jq -r '.data.id')

echo "✅ Produto criado com ID: $PRODUCT_ID"
echo ""

# Teste 3: Listar produtos
echo "📋 Listando todos os produtos..."
make_request "GET" "/produtos"

# Teste 4: Buscar produto por ID
echo "🔍 Buscando produto por ID..."
make_request "GET" "/produtos/$PRODUCT_ID"

# Teste 5: Atualizar produto (PUT)
echo "✏️ Atualizando produto completo..."
UPDATE_DATA='{
    "nome": "Smartphone Atualizado",
    "descricao": "Descrição atualizada via PUT",
    "preco": 2000.50,
    "categoria": "Eletrônicos Premium",
    "estoque": 5
}'
make_request "PUT" "/produtos/$PRODUCT_ID" "$UPDATE_DATA"

# Teste 6: Atualização parcial (PATCH) - DESAFIO BÔNUS
echo "🔧 Atualização parcial (PATCH) - DESAFIO BÔNUS!"
PATCH_DATA='{
    "preco": 1800.00,
    "estoque": 8
}'
make_request "PATCH" "/produtos/$PRODUCT_ID" "$PATCH_DATA"

# Teste 7: Deletar produto
echo "🗑️ Deletando produto..."
make_request "DELETE" "/produtos/$PRODUCT_ID"

# Teste 8: Verificar se foi deletado
echo "🔍 Verificando se produto foi deletado..."
make_request "GET" "/produtos/$PRODUCT_ID"

echo "🎉 Testes concluídos!"
echo "🏆 Badges desbloqueados: Mestre do CRUD + Desafio Bônus PATCH"
echo "📊 XP Total: 170 pontos"
