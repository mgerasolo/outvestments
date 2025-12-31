CREATE TYPE "public"."execution_discipline" AS ENUM('followed_cleanly', 'minor_delay', 'clear_violation', 'severe_neglect');--> statement-breakpoint
CREATE TYPE "public"."letter_grade" AS ENUM('AAA', 'AA+', 'AA', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'FF', 'FFF');--> statement-breakpoint
CREATE TYPE "public"."risk_grade" AS ENUM('A', 'B', 'C', 'D', 'F');--> statement-breakpoint
CREATE TYPE "public"."risk_plan_quality" AS ENUM('none', 'very_liberal', 'reasonable', 'structured');--> statement-breakpoint
CREATE TABLE "aim_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aim_id" uuid NOT NULL,
	"directional_accuracy" numeric(6, 2) NOT NULL,
	"magnitude_accuracy" numeric(6, 2) NOT NULL,
	"forecast_edge" numeric(6, 2) NOT NULL,
	"thesis_validity" numeric(6, 2) NOT NULL,
	"difficulty_multiplier" numeric(4, 2) NOT NULL,
	"final_score" numeric(6, 2) NOT NULL,
	"letter_grade" "letter_grade" NOT NULL,
	"risks_documented" boolean DEFAULT false NOT NULL,
	"thesis_validity_capped" boolean DEFAULT false NOT NULL,
	"self_rating" integer,
	"self_reflection_notes" text,
	"predicted_profit_per_day" numeric(10, 6),
	"predicted_profit_per_month" numeric(10, 4),
	"predicted_profit_per_year" numeric(10, 4),
	"actual_profit_per_day" numeric(10, 6),
	"actual_profit_per_month" numeric(10, 4),
	"actual_profit_per_year" numeric(10, 4),
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "aim_scores_aim_id_unique" UNIQUE("aim_id")
);
--> statement-breakpoint
CREATE TABLE "shot_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shot_id" uuid NOT NULL,
	"performance_score" numeric(6, 2) NOT NULL,
	"shot_forecast_edge" numeric(6, 2) NOT NULL,
	"perfect_shot_capture" numeric(6, 2) NOT NULL,
	"risk_mitigation_score" numeric(6, 2) NOT NULL,
	"risk_grade" "risk_grade" NOT NULL,
	"risk_multiplier" numeric(4, 2) NOT NULL,
	"adaptability_score" numeric(6, 2),
	"adaptability_bonus" numeric(4, 2) DEFAULT '0',
	"adaptability_locked" boolean DEFAULT true NOT NULL,
	"final_score" numeric(6, 2) NOT NULL,
	"letter_grade" "letter_grade" NOT NULL,
	"capital_time_weight" numeric(10, 4),
	"profit_per_day" numeric(10, 6),
	"profit_per_month" numeric(10, 4),
	"profit_per_year" numeric(10, 4),
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shot_scores_shot_id_unique" UNIQUE("shot_id")
);
--> statement-breakpoint
CREATE TABLE "target_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid NOT NULL,
	"prediction_score" numeric(6, 2),
	"prediction_grade" "letter_grade",
	"performance_score" numeric(6, 2),
	"performance_grade" "letter_grade",
	"total_pnl_dollars" numeric(14, 2),
	"total_pnl_percent" numeric(10, 4),
	"max_possible_return_percent" numeric(10, 4),
	"total_capital_invested" numeric(14, 2),
	"peak_capital_at_once" numeric(14, 2),
	"capital_efficiency" numeric(6, 4),
	"target_duration_days" integer,
	"held_until_end" boolean,
	"avg_holding_period_days" integer,
	"predicted_return_percent" numeric(10, 4),
	"actual_return_percent" numeric(10, 4),
	"prediction_accuracy_ratio" numeric(6, 4),
	"winning_aims_count" integer,
	"total_aims_count" integer,
	"win_ratio" numeric(4, 2),
	"market_return_percent" numeric(10, 4),
	"alpha_vs_market" numeric(10, 4),
	"avg_profit_per_day" numeric(10, 6),
	"avg_profit_per_month" numeric(10, 4),
	"avg_profit_per_year" numeric(10, 4),
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "target_scores_target_id_unique" UNIQUE("target_id")
);
--> statement-breakpoint
CREATE TABLE "user_career_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"prediction_quality_score" numeric(6, 2),
	"prediction_grade" "letter_grade",
	"performance_score" numeric(6, 2),
	"performance_grade" "letter_grade",
	"total_aims_scored" integer DEFAULT 0,
	"total_shots_scored" integer DEFAULT 0,
	"total_pnl_dollars" numeric(14, 2),
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_career_scores_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "aim_scores" ADD CONSTRAINT "aim_scores_aim_id_aims_id_fk" FOREIGN KEY ("aim_id") REFERENCES "public"."aims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shot_scores" ADD CONSTRAINT "shot_scores_shot_id_shots_id_fk" FOREIGN KEY ("shot_id") REFERENCES "public"."shots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_scores" ADD CONSTRAINT "target_scores_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_career_scores" ADD CONSTRAINT "user_career_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aim_scores_aim_id_idx" ON "aim_scores" USING btree ("aim_id");--> statement-breakpoint
CREATE INDEX "shot_scores_shot_id_idx" ON "shot_scores" USING btree ("shot_id");--> statement-breakpoint
CREATE INDEX "target_scores_target_id_idx" ON "target_scores" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "user_career_scores_user_id_idx" ON "user_career_scores" USING btree ("user_id");