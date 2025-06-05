const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.criarProduto = async ({ nome, descricao, preco, estoque, imagemUrl }) => {
  return await prisma.produto.create({
    data: { nome, descricao, preco, estoque, imagemUrl },
  });
};

exports.listarProdutos = async () => {
  return await prisma.produto.findMany();
};

exports.detalharProduto = async (id) => {
  return await prisma.produto.findUnique({ where: { id } });
};

exports.editarProduto = async (id, dados) => {
  return await prisma.produto.update({
    where: { id },
    data: dados,
  });
};

exports.deletarProduto = async (id) => {
  return await prisma.produto.delete({ where: { id } });
};
