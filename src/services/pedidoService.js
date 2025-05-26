import { findByEmail, updateStatus } from '../repositories/pedidoRepository';

export function listarPedidos(email) { return findByEmail(email); }
export function processPayment(id)  {     return updateStatus(id, 'pago');     }
