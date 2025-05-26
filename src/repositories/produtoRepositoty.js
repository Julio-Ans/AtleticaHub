import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export function create(data) { return prisma.produto.create({ data }); }
export function findAll() { return prisma.produto.findMany(); }
export function findById(id) { return prisma.produto.findUnique({ where: { id } }); }
export function update(id, data) {
    return prisma.produto.update({ where: { id }, data });
}
export function remove(id) {
    return prisma.produto.delete({ where: { id } });
}
