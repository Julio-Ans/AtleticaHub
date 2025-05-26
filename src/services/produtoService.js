import { create, findAll, update, remove } from '../repositories/produtoRepository';

export function createProduto(data) { return create(data); }
export function getAllProdutos() { return findAll(); }
export function updateProduto(id, data) { return update(id, data); }
export function deleteProduto(id) { return delete(id); }
