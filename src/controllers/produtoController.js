import { createProduto, getAllProdutos, updateProduto, deleteProduto } from '../services/produtoService';

export async function create(req, res, next) {
  try { res.status(201).json(await createProduto(req.body)); }
  catch (e) { next(e); }
}

export async function list(req, res, next) {
  try { res.json(await getAllProdutos()); }
  catch (e) { next(e); }
}

export async function update(req, res, next) {
  try { 
    const id = Number(req.params.id);
    res.json(await updateProduto(id, req.body));
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    deleteProduto(Number(req.params.id));
    res.json({ message: 'Produto removido' });
  } catch (e) { next(e); }
}
