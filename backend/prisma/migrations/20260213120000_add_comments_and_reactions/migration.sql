-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LOVE', 'SMILE', 'ANGRY', 'SIDE_EYE');


-- CreateTable
CREATE TABLE "EntryComment" (
  "id" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "parentId" TEXT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EntryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryReaction" (
  "id" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "ReactionType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EntryReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReaction" (
  "id" TEXT NOT NULL,
  "commentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "ReactionType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EntryComment_entryId_createdAt_idx" ON "EntryComment"("entryId", "createdAt");
CREATE INDEX "EntryComment_parentId_idx" ON "EntryComment"("parentId");
CREATE INDEX "EntryReaction_entryId_idx" ON "EntryReaction"("entryId");
CREATE UNIQUE INDEX "EntryReaction_entryId_userId_type_key" ON "EntryReaction"("entryId", "userId", "type");
CREATE INDEX "CommentReaction_commentId_idx" ON "CommentReaction"("commentId");
CREATE UNIQUE INDEX "CommentReaction_commentId_userId_type_key" ON "CommentReaction"("commentId", "userId", "type");

ALTER TABLE "EntryComment" ADD CONSTRAINT "EntryComment_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntryComment" ADD CONSTRAINT "EntryComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntryComment" ADD CONSTRAINT "EntryComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EntryComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntryReaction" ADD CONSTRAINT "EntryReaction_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntryReaction" ADD CONSTRAINT "EntryReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "EntryComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;