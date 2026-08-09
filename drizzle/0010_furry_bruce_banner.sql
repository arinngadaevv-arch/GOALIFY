ALTER TABLE "checkout_event" ADD COLUMN "whop_payment_id" text;--> statement-breakpoint
ALTER TABLE "checkout_event" ADD CONSTRAINT "checkout_event_whop_payment_id_unique" UNIQUE("whop_payment_id");