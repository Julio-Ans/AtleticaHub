const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserRepository {
  async findByUid(uid) {
    return await prisma.usuario.findUnique({
      where: { id: uid }
    });
  }

  async findById(id) {
    return await prisma.usuario.findUnique({
      where: { id }
    });
  }

  async create(userData) {
    return await prisma.usuario.create({
      data: userData
    });
  }

  async update(id, updateData) {
    return await prisma.usuario.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id) {
    return await prisma.usuario.delete({
      where: { id }
    });
  }

  async findAll() {
    return await prisma.usuario.findMany();
  }

  async findByEmail(email) {
    return await prisma.usuario.findUnique({
      where: { email }
    });
  }

  async findInviteCode(codigo) {
    return await prisma.inviteCode.findUnique({ 
      where: { code: codigo } 
    });
  }

  async markInviteCodeAsUsed(inviteId) {
    return await prisma.inviteCode.update({
      where: { id: inviteId },
      data: { used: true }
    });
  }

  async findEmailDomain(domain) {
    return await prisma.emailDomain.findUnique({ 
      where: { domain } 
    });
  }

  async findByRole(role) {
    return await prisma.usuario.findMany({
      where: { role }
    });
  }

  async updateRole(id, role) {
    return await prisma.usuario.update({
      where: { id },
      data: { role }
    });
  }
}

module.exports = new UserRepository();
