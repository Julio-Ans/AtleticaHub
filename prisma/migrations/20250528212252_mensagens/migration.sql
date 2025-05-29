/*
  Warnings:

  - The primary key for the `Esporte` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `codigo` on the `Esporte` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Esporte` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Esporte_codigo_key";

-- AlterTable
ALTER TABLE "Esporte" DROP CONSTRAINT "Esporte_pkey",
DROP COLUMN "codigo",
DROP COLUMN "createdAt",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Esporte_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Esporte_id_seq";

-- CreateTable
CREATE TABLE "Inscricao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "esporteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_esporteId_fkey" FOREIGN KEY ("esporteId") REFERENCES "Esporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
