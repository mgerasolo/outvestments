CREATE TYPE "public"."direction" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."shot_state" AS ENUM('pending', 'armed', 'fired', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."shot_type" AS ENUM('stock', 'option');--> statement-breakpoint
CREATE TYPE "public"."target_status" AS ENUM('active', 'watching', 'archived');--> statement-breakpoint
CREATE TYPE "public"."target_type" AS ENUM('growth', 'value', 'momentum', 'dividend', 'speculative');--> statement-breakpoint
CREATE TYPE "public"."trigger_type" AS ENUM('market', 'limit');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('viewer', 'user', 'power_user', 'admin');--> statement-breakpoint
CREATE TABLE "aims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"target_price_realistic" numeric(12, 4) NOT NULL,
	"target_price_reach" numeric(12, 4),
	"target_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "alpaca_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_key" text NOT NULL,
	"encrypted_secret" text NOT NULL,
	"iv" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpaca_credentials_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"payload" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_cache" (
	"symbol" text PRIMARY KEY NOT NULL,
	"price" numeric(12, 4) NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shot_id" uuid NOT NULL,
	"accuracy" numeric(5, 4) NOT NULL,
	"performance" numeric(8, 4) NOT NULL,
	"difficulty" numeric(5, 4) NOT NULL,
	"trajectory" numeric(5, 4) NOT NULL,
	"ppd" numeric(10, 4) NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scores_shot_id_unique" UNIQUE("shot_id")
);
--> statement-breakpoint
CREATE TABLE "shots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aim_id" uuid,
	"direction" "direction" NOT NULL,
	"entry_price" numeric(12, 4) NOT NULL,
	"entry_date" timestamp with time zone NOT NULL,
	"position_size" numeric(12, 4),
	"trigger_type" "trigger_type" DEFAULT 'market' NOT NULL,
	"shot_type" "shot_type" DEFAULT 'stock' NOT NULL,
	"state" "shot_state" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"thesis" text NOT NULL,
	"target_type" "target_type" NOT NULL,
	"catalyst" text,
	"tags" json DEFAULT '[]'::json,
	"status" "target_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authentik_sub" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_authentik_sub_unique" UNIQUE("authentik_sub"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "aims" ADD CONSTRAINT "aims_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpaca_credentials" ADD CONSTRAINT "alpaca_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_shot_id_shots_id_fk" FOREIGN KEY ("shot_id") REFERENCES "public"."shots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shots" ADD CONSTRAINT "shots_aim_id_aims_id_fk" FOREIGN KEY ("aim_id") REFERENCES "public"."aims"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aims_target_id_idx" ON "aims" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "aims_symbol_idx" ON "aims" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "aims_deleted_at_idx" ON "aims" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "alpaca_credentials_user_id_idx" ON "alpaca_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "price_cache_fetched_at_idx" ON "price_cache" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX "scores_shot_id_idx" ON "scores" USING btree ("shot_id");--> statement-breakpoint
CREATE INDEX "shots_aim_id_idx" ON "shots" USING btree ("aim_id");--> statement-breakpoint
CREATE INDEX "shots_state_idx" ON "shots" USING btree ("state");--> statement-breakpoint
CREATE INDEX "shots_deleted_at_idx" ON "shots" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "targets_user_id_idx" ON "targets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "targets_status_idx" ON "targets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "targets_deleted_at_idx" ON "targets" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "users_authentik_sub_idx" ON "users" USING btree ("authentik_sub");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");