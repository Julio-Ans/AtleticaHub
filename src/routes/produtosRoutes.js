const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const upload = require('../middlewares/upload'); // Importa o middleware de upload (Multer)

// Criar produto (admin apenas)
router.post(
  '/',
  verificarToken,
  checkRole('admin'),
  upload.single('imagem'),
  produtoController.criarProduto
);

// Listar todos os produtos (público)
router.get('/', produtoController.listarProdutos);

// Detalhar um produto (público)
router.get('/:id', produtoController.detalharProduto);
router.get('/:id/recomendar', produtoController.getProdutoDetalhesComRecomendacoes); // Nova rota para recomendar produtos

// Editar produto (admin)
router.put(
  '/:id',
  verificarToken,
  checkRole('admin'),
  upload.single('imagem'),
  produtoController.editarProduto
);

// Deletar produto (admin)
router.delete(
  '/:id',
  verificarToken,
  checkRole('admin'),
  produtoController.deletarProduto
);

// Rota para atualizar todas as imagens dos produtos aleatoriamente (admin apenas)
router.post(
  '/admin/atualizar-imagens-aleatorias',
  verificarToken,
  checkRole('admin'),
  produtoController.atualizarImagensProdutosAleatoriamente
);

module.exports = router;
