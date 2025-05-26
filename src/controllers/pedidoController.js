import { listarPedidos, processPayment } from '../services/pedidoService';

export async function list(req, res, next) {
  try { res.json(await listarPedidos(req.query.studentEmail)); }
  catch (e) { next(e); }
}

export async function pay(req, res, next) {
  try { res.json(await processPayment(Number(req.params.id))); }
  catch (e) { next(e); }
}
