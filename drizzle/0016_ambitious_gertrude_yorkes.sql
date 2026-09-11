CREATE TYPE "public"."admin_flag" AS ENUM('VIP', 'PROBLEM');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin_flag" "admin_flag";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin_note" text;