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

module.exports = router;
