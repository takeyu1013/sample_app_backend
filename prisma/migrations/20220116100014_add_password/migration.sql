/*
  Warnings:

  - Added the required column `password_digest` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_digest" TEXT NOT NULL;
