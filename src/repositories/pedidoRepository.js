import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export function create(data) { return prisma.pedido.create({ data }); }
export function findByEmail(email) {
    return prisma.pedido.findMany({ where: { studentEmail: email } });
}
export function updateStatus(id, status) {
    return prisma.pedido.update({
        where: { id },
        data: { status },
    });
}
