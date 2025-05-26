import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export function add(data) { return prisma.cartItem.create({ data }); }
export function findByEmail(email) {
    return prisma.cartItem.findMany({
        where: { studentEmail: email },
        include: { produto: true },
    });
}
export function findById(id) {
    return prisma.cartItem.findUnique({
        where: { id },
        include: { produto: true },
    });
}
export function updateQty(id, quantidade) {
    return prisma.cartItem.update({
        where: { id },
        data: { quantidade },
    });
}
export function remove(id) { return prisma.cartItem.delete({ where: { id } }); }
export function clearByEmail(email) {
    return prisma.cartItem.deleteMany({ where: { studentEmail: email } });
}
