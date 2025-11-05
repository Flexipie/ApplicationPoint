CREATE INDEX IF NOT EXISTS "applications_user_id_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "applications_status_idx" ON "applications" USING btree ("current_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "applications_created_at_idx" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "applications_user_status_idx" ON "applications" USING btree ("user_id","current_status");