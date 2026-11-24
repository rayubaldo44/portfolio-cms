-- Additive update for databases managed with prisma db push.
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "screenshots" JSONB NOT NULL DEFAULT '[]';
