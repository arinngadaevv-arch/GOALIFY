CREATE TYPE "public"."confidence_level" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."decision_status" AS ENUM('DRAFT', 'APPROVED', 'SENT');--> statement-breakpoint
CREATE TYPE "public"."execution_time" AS ENUM('UNDER_10', 'TEN_TO_30', 'OVER_30');--> statement-breakpoint
CREATE TYPE "public"."move_channel" AS ENUM('REEL', 'STORY', 'DM_OUTREACH', 'CALL', 'PRICE_CHANGE', 'REPLY_TO_COMMENTS', 'NONE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."move_type" AS ENUM('EXPLOIT', 'EXPLORE');--> statement-breakpoint
CREATE TYPE "public"."outcome_result" AS ENUM('MORE_VIEWS', 'MORE_MESSAGES', 'MORE_COMMENTS', 'NOTHING', 'OTHER');--> statement-breakpoint
CREATE TABLE "business" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"niche" text DEFAULT 'cosmetology' NOT NULL,
	"reach_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"status" "decision_status" DEFAULT 'DRAFT' NOT NULL,
	"signals" jsonb NOT NULL,
	"diagnosis" text NOT NULL,
	"confidence" "confidence_level" NOT NULL,
	"confidence_reasoning" text NOT NULL,
	"evidence" jsonb NOT NULL,
	"alternatives_considered" jsonb NOT NULL,
	"move_type" "move_type" NOT NULL,
	"move_channel" "move_channel" NOT NULL,
	"move_description" text NOT NULL,
	"estimated_minutes" integer,
	"falsification_criteria" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"approved_by_user_id" text,
	"sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "outcome" (
	"id" text PRIMARY KEY NOT NULL,
	"decision_id" text NOT NULL,
	"did_execute" boolean,
	"execution_time" "execution_time",
	"immediate_answered_at" timestamp,
	"result" "outcome_result",
	"result_note" text,
	"followup_answered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "outcome_decision_id_unique" UNIQUE("decision_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision" ADD CONSTRAINT "decision_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision" ADD CONSTRAINT "decision_approved_by_user_id_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcome" ADD CONSTRAINT "outcome_decision_id_decision_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decision"("id") ON DELETE cascade ON UPDATE no action;