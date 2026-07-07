CREATE TYPE "public"."automation_mode" AS ENUM('suggest_only', 'approve', 'auto');--> statement-breakpoint
CREATE TYPE "public"."recommendation_category" AS ENUM('conversion', 'seo', 'design', 'accessibility', 'copywriting', 'trust', 'pricing', 'performance');--> statement-breakpoint
CREATE TYPE "public"."recommendation_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."recommendation_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('pending', 'approved', 'applied', 'dismissed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."scan_target" AS ENUM('store', 'homepage', 'collection', 'product', 'checkout', 'navigation', 'page');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('queued', 'running', 'done', 'error');--> statement-breakpoint
CREATE TABLE "daily_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"report_date" text NOT NULL,
	"completed_improvements" integer DEFAULT 0 NOT NULL,
	"new_opportunities" integer DEFAULT 0 NOT NULL,
	"critical_issues" integer DEFAULT 0 NOT NULL,
	"estimated_revenue_opportunity_cents" integer,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"shopify_product_id" text NOT NULL,
	"title" text NOT NULL,
	"handle" text,
	"status" text,
	"price" numeric(12, 2),
	"image_count" integer DEFAULT 0 NOT NULL,
	"variant_count" integer DEFAULT 0 NOT NULL,
	"optimization_score" integer,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"scan_id" uuid,
	"product_id" uuid,
	"category" "recommendation_category" NOT NULL,
	"severity" "recommendation_severity" DEFAULT 'medium' NOT NULL,
	"title" text NOT NULL,
	"problem" text NOT NULL,
	"reason" text NOT NULL,
	"estimated_impact" text,
	"estimated_revenue_cents" integer,
	"ai_recommendation" text DEFAULT '' NOT NULL,
	"difficulty" "recommendation_difficulty" DEFAULT 'easy' NOT NULL,
	"estimated_time_saved_minutes" integer,
	"proposed_change" jsonb,
	"status" "recommendation_status" DEFAULT 'pending' NOT NULL,
	"applied_at" timestamp with time zone,
	"applied_result" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"target" "scan_target" NOT NULL,
	"target_ref" text,
	"store_health_score" integer,
	"conversion_score" integer,
	"seo_score" integer,
	"design_score" integer,
	"trust_score" integer,
	"performance_score" integer,
	"accessibility_score" integer,
	"raw_findings" jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "shop_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"automation_mode" "automation_mode" DEFAULT 'suggest_only' NOT NULL,
	"auto_apply_categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"brand_tone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_settings_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" text NOT NULL,
	"access_token" text NOT NULL,
	"scope" text NOT NULL,
	"shop_name" text,
	"email" text,
	"plan_name" text,
	"currency" text,
	"timezone" text,
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uninstalled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shops_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"shopify_charge_id" text,
	"plan_name" text DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"recommendation_id" uuid,
	"type" text NOT NULL,
	"status" "task_status" DEFAULT 'queued' NOT NULL,
	"payload" jsonb,
	"result" jsonb,
	"error" text,
	"scheduled_for" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid,
	"topic" text NOT NULL,
	"shopify_webhook_id" text,
	"payload" jsonb,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_shopify_webhook_id_unique" UNIQUE("shopify_webhook_id")
);
--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_settings" ADD CONSTRAINT "shop_settings_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_recommendation_id_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;