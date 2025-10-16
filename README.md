# Missão 8 - O Mestre dos Dados 🧩

## 🎯 Objetivo
API RESTful completa com operações CRUD usando Node.js, Express e AirTable como banco de dados.

## 🛠️ Tecnologias
- **Backend**: Node.js + Express
- **Banco de Dados**: AirTable
- **Testes**: Jest + Supertest
- **Deploy**: Render/Vercel

## 📋 Entidade Modelada: Produto
- **id**: Identificador único
- **nome**: Nome do produto
- **descricao**: Descrição detalhada
- **preco**: Preço em reais
- **categoria**: Categoria do produto
- **estoque**: Quantidade em estoque
- **ativo**: Status ativo/inativo
- **dataCriacao**: Data de criação
- **dataAtualizacao**: Data da última atualização

## 🚀 Como executar

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Editar .env com suas credenciais do AirTable
```

3. Executar em desenvolvimento:
```bash
npm run dev
```

4. Executar em produção:
```bash
npm start
```

## 📡 Endpoints da API

### Base URL: `https://sua-api.com/api/v1`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/produtos` | Criar novo produto |
| GET | `/produtos` | Listar todos os produtos |
| GET | `/produtos/:id` | Buscar produto por ID |
| PUT | `/produtos/:id` | Atualizar produto completo |
| PATCH | `/produtos/:id` | Atualizar produto parcial |
| DELETE | `/produtos/:id` | Deletar produto |

## 🧪 Testando a API

Use o Postman ou curl para testar os endpoints:

```bash
# Criar produto
curl -X POST http://localhost:3000/api/v1/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Smartphone","descricao":"Celular moderno","preco":1500,"categoria":"Eletrônicos","estoque":10}'

# Listar produtos
curl http://localhost:3000/api/v1/produtos

# Buscar por ID
curl http://localhost:3000/api/v1/produtos/1

# Atualizar produto
curl -X PUT http://localhost:3000/api/v1/produtos/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Smartphone Pro","preco":2000}'

# Atualização parcial
curl -X PATCH http://localhost:3000/api/v1/produtos/1 \
  -H "Content-Type: application/json" \
  -d '{"preco":1800}'

# Deletar produto
curl -X DELETE http://localhost:3000/api/v1/produtos/1
```

## 📥 Importar Tabela no AirTable

1. Crie uma base e uma tabela chamada `Produtos`.
2. Importe o arquivo `airtable/seed.csv` para criar os campos automaticamente.
3. Opcional: use `airtable/seed.json` para criar em massa via API.

Campos esperados:
- `Nome` (Single line text)
- `Descricao` (Long text)
- `Preco` (Number, currency BRL)
- `Categoria` (Single line text)
- `Estoque` (Number, integer)
- `Ativo` (Checkbox)
- `DataCriacao` (Date)
- `DataAtualizacao` (Date)

## 🏆 Badges Desbloqueados
- ✅ Mestre do CRUD
- ✅ Desafio Bônus PATCH (+20 XP)

## 📊 XP Total: 170 pontos
