import { findById } from '../repositories/produtoRepository';
import { add, findByEmail, findById as _findById, updateQty, remove } from '../repositories/cartItemRepository';

export async function addToCart({ studentEmail, produtoId, quantidade }) {
  const produto = await findById(produtoId);
  if (!produto) throw { status: 404, message: 'Produto não encontrado' };
  if (produto.estoque < quantidade)
    throw { status: 400, message: 'Estoque insuficiente' };

  return add({ studentEmail, produtoId, quantidade });
}

export function getCart(email) { return findByEmail(email); }

export async function updateCartItem(id, quantidade) {
  const item = await _findById(id);
  if (!item) throw { status: 404, message: 'Item não encontrado' };
  if (item.produto.estoque < quantidade)
    throw { status: 400, message: 'Estoque insuficiente' };

  return updateQty(id, quantidade);
}

export function removeCartItem(id) { return remove(id); }

export async function checkout(studentEmail) {
  const items = await findByEmail(studentEmail);
  if (!items.length) throw { status: 400, message: 'Carrinho vazio' };

  let total = 0;
  const produtosPedido = [];

  return require('@prisma/client').PrismaClient().$transaction(async prisma => {
    for (const item of items) {
      if (item.produto.estoque < item.quantidade)
        throw { status: 400, message: `Estoque insuficiente para ${item.produto.nome}` };

      total += item.produto.preco * item.quantidade;
      produtosPedido.push({ produtoId: item.produto.id, quantidade: item.quantidade });

      await prisma.produto.update({
        where: { id: item.produto.id },
        data: { estoque: item.produto.estoque - item.quantidade },
      });
    }

    const pedido = await prisma.pedido.create({
      data: { studentEmail, produtos: produtosPedido, total, status: 'pendente' },
    });

    await prisma.cartItem.deleteMany({ where: { studentEmail } });
    return pedido;
  });
}
