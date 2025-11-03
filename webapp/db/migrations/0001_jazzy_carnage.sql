-- Drop existing primary keys
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey";--> statement-breakpoint
ALTER TABLE "verification_tokens" DROP CONSTRAINT IF EXISTS "verification_tokens_pkey";--> statement-breakpoint

-- Drop unique constraints
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_session_token_unique";--> statement-breakpoint
ALTER TABLE "verification_tokens" DROP CONSTRAINT "verification_tokens_token_unique";--> statement-breakpoint

-- Add new primary keys
ALTER TABLE "sessions" ADD PRIMARY KEY ("session_token");--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token");--> statement-breakpoint

-- Drop old id column
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "id";