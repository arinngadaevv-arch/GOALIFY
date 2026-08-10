CREATE TYPE "public"."analytics_device" AS ENUM('MOBILE', 'DESKTOP');--> statement-breakpoint
CREATE TYPE "public"."analytics_event_kind" AS ENUM('LANDING_VIEW', 'QUIZ_STEP', 'QUIZ_COMPLETE');--> statement-breakpoint
CREATE TABLE "analytics_event" (
	"id" text PRIMARY KEY NOT NULL,
	"visitor_id" text NOT NULL,
	"user_id" text,
	"kind" "analytics_event_kind" NOT NULL,
	"step_id" text,
	"step_index" integer,
	"device" "analytics_device",
	"path" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_event" ADD CONSTRAINT "analytics_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;