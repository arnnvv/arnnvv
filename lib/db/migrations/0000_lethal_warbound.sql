CREATE TABLE "arnnvv_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arnnvv_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_id" text NOT NULL,
	"email" varchar NOT NULL,
	"name" text NOT NULL,
	"picture" text NOT NULL,
	CONSTRAINT "arnnvv_users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "arnnvv_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "arnnvv_sessions" ADD CONSTRAINT "arnnvv_sessions_user_id_arnnvv_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."arnnvv_users"("id") ON DELETE no action ON UPDATE no action;