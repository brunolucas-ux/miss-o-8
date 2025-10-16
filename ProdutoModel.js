const { airtableTable: table } = require('../utils/airtable');

class ProdutoModel {
  // Criar novo produto
  static async create(produtoData) {
    try {
      const fields = {
        Nome: produtoData.nome,
        Descricao: produtoData.descricao,
        Preco: Number(produtoData.preco),
        Categoria: produtoData.categoria,
        Estoque: Number(produtoData.estoque),
        DataCriacao: new Date().toISOString(),
        DataAtualizacao: new Date().toISOString()
      };

      // Define Ativo somente se for boolean estrito; caso contrário, não envia o campo
      if (typeof produtoData.ativo === 'boolean') {
        fields.Ativo = produtoData.ativo;
      }

      const created = await table.create([
        {
          fields
        }
      ], { typecast: true });

      const record = Array.isArray(created) ? created[0] : created;

      return {
        id: record.id,
        nome: record.fields.Nome,
        descricao: record.fields.Descricao,
        preco: record.fields.Preco,
        categoria: record.fields.Categoria,
        estoque: record.fields.Estoque,
        ativo: record.fields.Ativo,
        dataCriacao: record.fields.DataCriacao,
        dataAtualizacao: record.fields.DataAtualizacao
      };
    } catch (error) {
      // Log detalhado para diagnóstico
      // eslint-disable-next-line no-console
      console.error('Airtable create error:', error);
      const err = new Error(error?.message || 'Erro ao criar produto');
      if (error?.statusCode) err.statusCode = error.statusCode;
      if (error?.error) err.details = error.error;
      throw err;
    }
  }

  // Buscar todos os produtos
  static async findAll() {
    try {
      const records = await table.select({
        sort: [{ field: 'DataCriacao', direction: 'desc' }]
      }).all();

      return records.map(record => ({
        id: record.id,
        nome: record.fields.Nome,
        descricao: record.fields.Descricao,
        preco: record.fields.Preco,
        categoria: record.fields.Categoria,
        estoque: record.fields.Estoque,
        ativo: record.fields.Ativo,
        dataCriacao: record.fields.DataCriacao,
        dataAtualizacao: record.fields.DataAtualizacao
      }));
    } catch (error) {
      throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }
  }

  // Buscar produto por ID
  static async findById(id) {
    try {
      const record = await table.find(id);
      
      return {
        id: record.id,
        nome: record.fields.Nome,
        descricao: record.fields.Descricao,
        preco: record.fields.Preco,
        categoria: record.fields.Categoria,
        estoque: record.fields.Estoque,
        ativo: record.fields.Ativo,
        dataCriacao: record.fields.DataCriacao,
        dataAtualizacao: record.fields.DataAtualizacao
      };
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new Error(`Erro ao buscar produto: ${error.message}`);
    }
  }

  // Atualizar produto completo
  static async update(id, produtoData) {
    try {
      const updateData = {
        DataAtualizacao: new Date().toISOString()
      };

      // Adicionar apenas campos que foram fornecidos
      if (produtoData.nome !== undefined) updateData.Nome = produtoData.nome;
      if (produtoData.descricao !== undefined) updateData.Descricao = produtoData.descricao;
      if (produtoData.preco !== undefined) updateData.Preco = produtoData.preco;
      if (produtoData.categoria !== undefined) updateData.Categoria = produtoData.categoria;
      if (produtoData.estoque !== undefined) updateData.Estoque = produtoData.estoque;
      if (produtoData.ativo !== undefined) updateData.Ativo = produtoData.ativo;

      const record = await table.update(id, updateData);

      return {
        id: record.id,
        nome: record.fields.Nome,
        descricao: record.fields.Descricao,
        preco: record.fields.Preco,
        categoria: record.fields.Categoria,
        estoque: record.fields.Estoque,
        ativo: record.fields.Ativo,
        dataCriacao: record.fields.DataCriacao,
        dataAtualizacao: record.fields.DataAtualizacao
      };
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }
  }

  // Atualização parcial (PATCH)
  static async patch(id, produtoData) {
    try {
      const updateData = {
        DataAtualizacao: new Date().toISOString()
      };

      // Adicionar apenas campos que foram fornecidos
      if (produtoData.nome !== undefined) updateData.Nome = produtoData.nome;
      if (produtoData.descricao !== undefined) updateData.Descricao = produtoData.descricao;
      if (produtoData.preco !== undefined) updateData.Preco = produtoData.preco;
      if (produtoData.categoria !== undefined) updateData.Categoria = produtoData.categoria;
      if (produtoData.estoque !== undefined) updateData.Estoque = produtoData.estoque;
      if (produtoData.ativo !== undefined) updateData.Ativo = produtoData.ativo;

      const record = await table.update(id, updateData);

      return {
        id: record.id,
        nome: record.fields.Nome,
        descricao: record.fields.Descricao,
        preco: record.fields.Preco,
        categoria: record.fields.Categoria,
        estoque: record.fields.Estoque,
        ativo: record.fields.Ativo,
        dataCriacao: record.fields.DataCriacao,
        dataAtualizacao: record.fields.DataAtualizacao
      };
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new Error(`Erro ao atualizar produto parcialmente: ${error.message}`);
    }
  }

  // Deletar produto
  static async delete(id) {
    try {
      await table.destroy(id);
      return true;
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new Error(`Erro ao deletar produto: ${error.message}`);
    }
  }
}

module.exports = ProdutoModel;
