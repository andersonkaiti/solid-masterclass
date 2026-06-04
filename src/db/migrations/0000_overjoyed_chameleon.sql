CREATE TYPE "public"."preferred_marketing_channel" AS ENUM('email', 'sms', 'push', 'whatsapp');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"age" integer NOT NULL,
	"phone_number" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"preferred_marketing_channel" "preferred_marketing_channel" NOT NULL,
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
