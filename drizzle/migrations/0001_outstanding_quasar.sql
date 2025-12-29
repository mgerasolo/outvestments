CREATE TYPE "public"."aim_status" AS ENUM('active', 'expiring', 'expired', 'closed', 'hit', 'rolled_over');--> statement-breakpoint
CREATE TYPE "public"."market_type" AS ENUM('stock', 'etf', 'crypto', 'forex', 'index');--> statement-breakpoint
ALTER TYPE "public"."shot_state" ADD VALUE 'partially_closed';--> statement-breakpoint
CREATE TABLE "portfolio_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"trading_date" timestamp with time zone NOT NULL,
	"portfolio_value" numeric(14, 2) NOT NULL,
	"cash" numeric(14, 2) NOT NULL,
	"buying_power" numeric(14, 2) NOT NULL,
	"day_pl" numeric(14, 2) NOT NULL,
	"day_pl_percent" numeric(8, 4) NOT NULL,
	"positions_snapshot" json DEFAULT '[]'::json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "symbols" (
	"symbol" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"exchange" varchar(100),
	"market_type" "market_type" NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"logo_url" varchar(500),
	"finnhub_industry" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"notes" text,
	"alert_price" numeric(12, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aims" ADD COLUMN "status" "aim_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "aims" ADD COLUMN "stop_loss_price" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "aims" ADD COLUMN "take_profit_price" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "aims" ADD COLUMN "exit_conditions" text;--> statement-breakpoint
ALTER TABLE "aims" ADD COLUMN "rolled_from_id" uuid;--> statement-breakpoint
ALTER TABLE "aims" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "aims" ADD COLUMN "closed_reason" text;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "stop_loss_price" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "stop_loss_order_id" text;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "alpaca_order_id" text;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "fill_price" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "fill_timestamp" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "filled_qty" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "alpaca_status" text;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "parent_shot_id" uuid;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "exit_price" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "exit_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "closed_quantity" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "realized_pl" numeric(14, 4);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "alpaca_close_order_id" text;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "days_held" integer;--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "return_percentage" numeric(10, 4);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "annualized_return_percentage" numeric(10, 4);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "accuracy_score" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "performance_score" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "difficulty_multiplier" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "shots" ADD COLUMN "composite_score" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "targets" ADD COLUMN "confidence_level" numeric(3, 1);--> statement-breakpoint
ALTER TABLE "targets" ADD COLUMN "risks" text;--> statement-breakpoint
ALTER TABLE "targets" ADD COLUMN "exit_triggers" text;--> statement-breakpoint
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_snapshots_user_id_idx" ON "portfolio_snapshots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "portfolio_snapshots_trading_date_idx" ON "portfolio_snapshots" USING btree ("trading_date");--> statement-breakpoint
CREATE INDEX "portfolio_snapshots_user_date_idx" ON "portfolio_snapshots" USING btree ("user_id","trading_date");--> statement-breakpoint
CREATE INDEX "symbols_name_idx" ON "symbols" USING btree ("name");--> statement-breakpoint
CREATE INDEX "symbols_market_type_idx" ON "symbols" USING btree ("market_type");--> statement-breakpoint
CREATE INDEX "symbols_is_active_idx" ON "symbols" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "watchlist_user_id_idx" ON "watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watchlist_symbol_idx" ON "watchlist" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "watchlist_user_symbol_idx" ON "watchlist" USING btree ("user_id","symbol");--> statement-breakpoint
CREATE INDEX "aims_status_idx" ON "aims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shots_alpaca_order_id_idx" ON "shots" USING btree ("alpaca_order_id");--> statement-breakpoint
CREATE INDEX "shots_parent_shot_id_idx" ON "shots" USING btree ("parent_shot_id");