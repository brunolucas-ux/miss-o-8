const request = require('supertest');
const app = require('../server');

describe('API de Produtos - Missão 8', () => {
  let produtoId;

  describe('POST /api/v1/produtos', () => {
    it('deve criar um novo produto com sucesso', async () => {
      const produtoData = {
        nome: 'Smartphone Teste',
        descricao: 'Celular moderno para testes',
        preco: 1500.99,
        categoria: 'Eletrônicos',
        estoque: 10
      };

      const response = await request(app)
        .post('/api/v1/produtos')
        .send(produtoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe(produtoData.nome);
      expect(response.body.data.preco).toBe(produtoData.preco);
      expect(response.body.badges).toContain('Mestre do CRUD');
      expect(response.body.xp).toBe(30);

      produtoId = response.body.data.id;
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const produtoData = {
        nome: '', // nome vazio
        preco: -100, // preço negativo
        estoque: 'abc' // estoque inválido
      };

      const response = await request(app)
        .post('/api/v1/produtos')
        .send(produtoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/produtos', () => {
    it('deve listar todos os produtos', async () => {
      const response = await request(app)
        .get('/api/v1/produtos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeDefined();
      expect(response.body.badges).toContain('Mestre do CRUD');
      expect(response.body.xp).toBe(20);
    });
  });

  describe('GET /api/v1/produtos/:id', () => {
    it('deve buscar produto por ID com sucesso', async () => {
      const response = await request(app)
        .get(`/api/v1/produtos/${produtoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(produtoId);
      expect(response.body.badges).toContain('Mestre do CRUD');
      expect(response.body.xp).toBe(20);
    });

    it('deve retornar erro 404 para produto não encontrado', async () => {
      const response = await request(app)
        .get('/api/v1/produtos/id_inexistente')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Produto não encontrado');
    });
  });

  describe('PUT /api/v1/produtos/:id', () => {
    it('deve atualizar produto completo com sucesso', async () => {
      const updateData = {
        nome: 'Smartphone Atualizado',
        descricao: 'Descrição atualizada',
        preco: 2000.50,
        categoria: 'Eletrônicos Premium',
        estoque: 5
      };

      const response = await request(app)
        .put(`/api/v1/produtos/${produtoId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe(updateData.nome);
      expect(response.body.data.preco).toBe(updateData.preco);
      expect(response.body.badges).toContain('Mestre do CRUD');
      expect(response.body.xp).toBe(25);
    });
  });

  describe('PATCH /api/v1/produtos/:id', () => {
    it('deve atualizar produto parcialmente com sucesso (DESAFIO BÔNUS)', async () => {
      const updateData = {
        preco: 1800.00,
        estoque: 8
      };

      const response = await request(app)
        .patch(`/api/v1/produtos/${produtoId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preco).toBe(updateData.preco);
      expect(response.body.data.estoque).toBe(updateData.estoque);
      expect(response.body.badges).toContain('Desafio Bônus PATCH');
      expect(response.body.xp).toBe(35);
    });
  });

  describe('DELETE /api/v1/produtos/:id', () => {
    it('deve deletar produto com sucesso', async () => {
      const response = await request(app)
        .delete(`/api/v1/produtos/${produtoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(produtoId);
      expect(response.body.badges).toContain('Mestre do CRUD');
      expect(response.body.xp).toBe(20);
    });

    it('deve retornar erro 404 para produto não encontrado', async () => {
      const response = await request(app)
        .delete('/api/v1/produtos/id_inexistente')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Produto não encontrado');
    });
  });

  describe('Health Check', () => {
    it('deve retornar status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('API funcionando perfeitamente!');
    });
  });

  describe('Rota raiz', () => {
    it('deve retornar informações da API', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('🧩 Missão 8 - O Mestre dos Dados');
      expect(response.body.badges).toContain('Mestre do CRUD');
      expect(response.body.badges).toContain('Desafio Bônus PATCH');
      expect(response.body.xp).toBe(170);
    });
  });
});
