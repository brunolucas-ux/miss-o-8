const express = require('express');
const ProdutoModel = require('../models/ProdutoModel');
const { validateProduto, validateProdutoUpdate } = require('../middleware/validation');

const router = express.Router();

// POST /api/v1/produtos - Criar novo produto
router.post('/', validateProduto, async (req, res, next) => {
  try {
    const produto = await ProdutoModel.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso!',
      data: produto,
      badges: ['Mestre do CRUD'],
      xp: 30
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/produtos - Listar todos os produtos
router.get('/', async (req, res, next) => {
  try {
    const produtos = await ProdutoModel.findAll();
    
    res.status(200).json({
      success: true,
      message: `Encontrados ${produtos.length} produtos`,
      data: produtos,
      count: produtos.length,
      badges: ['Mestre do CRUD'],
      xp: 20
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/produtos/:id - Buscar produto por ID
router.get('/:id', async (req, res, next) => {
  try {
    const produto = await ProdutoModel.findById(req.params.id);
    
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
        error: 'NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Produto encontrado com sucesso!',
      data: produto,
      badges: ['Mestre do CRUD'],
      xp: 20
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/produtos/:id - Atualizar produto completo
router.put('/:id', validateProdutoUpdate, async (req, res, next) => {
  try {
    const produto = await ProdutoModel.update(req.params.id, req.body);
    
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
        error: 'NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: produto,
      badges: ['Mestre do CRUD'],
      xp: 25
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/produtos/:id - Atualização parcial (DESAFIO BÔNUS)
router.patch('/:id', async (req, res, next) => {
  try {
    const produto = await ProdutoModel.patch(req.params.id, req.body);
    
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
        error: 'NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Produto atualizado parcialmente com sucesso!',
      data: produto,
      badges: ['Mestre do CRUD', 'Desafio Bônus PATCH'],
      xp: 35
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/produtos/:id - Deletar produto
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await ProdutoModel.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
        error: 'NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Produto deletado com sucesso!',
      data: { id: req.params.id },
      badges: ['Mestre do CRUD'],
      xp: 20
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
