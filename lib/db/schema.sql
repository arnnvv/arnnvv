CREATE TABLE "arnnvv_sessions" (
    "id"                text PRIMARY KEY NOT NULL,
    "user_id"           integer NOT NULL,
    "expires_at"        timestamp with time zone NOT NULL
);

CREATE TABLE "arnnvv_users" (
    "id"                serial PRIMARY KEY NOT NULL,
    "google_id"         text NOT NULL,
    "email"             varchar NOT NULL,
    "name"              text NOT NULL,
    "picture"           text NOT NULL,
    CONSTRAINT          "arnnvv_users_google_id_unique" UNIQUE("google_id"),
    CONSTRAINT          "arnnvv_users_email_unique"     UNIQUE("email")
);

CREATE TABLE "arnnvv_blogs" (
    "id"                serial PRIMARY KEY NOT NULL,
    "title"             varchar NOT NULL,
    "description"       text NOT NULL,
    "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at"        timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "arnnvv_comments" (
    "id"                serial PRIMARY KEY NOT NULL,
    "blog_id"           integer NOT NULL,
    "user_id"           integer NOT NULL,
    "parent_comment_id" integer,
    "content"           text NOT NULL,
    "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at"        timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "arnnvv_comment_likes" (
    "user_id"    integer NOT NULL,
    "comment_id" integer NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    -- Composite primary key ensures a user can only like a specific comment once
    PRIMARY KEY ("user_id", "comment_id")
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the NEW record (the one being updated to) is different
    -- from the OLD record regarding the updated_at column itself.
    -- This prevents infinite loops if an UPDATE statement explicitly tries
    -- to set updated_at, though it's generally good practice.
    -- More importantly, set it to the transaction timestamp.
    IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
        NEW.updated_at = now(); -- Or current_timestamp
        RETURN NEW; -- Return the modified row to be updated
    ELSE
        -- If nothing else changed, don't update the timestamp
        RETURN OLD; -- Return the original row to prevent the update trigger firing recursively (less common but safe)
                   -- Alternatively, RETURN NEW works too if no other triggers modify the row.
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_arnnvv_blogs_set_updated_at
BEFORE UPDATE ON arnnvv_blogs       -- Fire before an UPDATE operation
FOR EACH ROW                        -- Execute for every row being updated
EXECUTE FUNCTION set_updated_at();  -- Call the function we created

CREATE TRIGGER trigger_arnnvv_comments_set_updated_at
BEFORE UPDATE ON arnnvv_comments    -- Fire before an UPDATE operation
FOR EACH ROW                        -- Execute for every row being updated
EXECUTE FUNCTION set_updated_at();  -- Call the same function

ALTER TABLE "arnnvv_sessions"
ADD CONSTRAINT "arnnvv_sessions_user_id_arnnvv_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."arnnvv_users"("id")
ON DELETE NO ACTION
ON UPDATE NO ACTION;

ALTER TABLE "arnnvv_comments"
ADD CONSTRAINT "arnnvv_comments_blog_id_arnnvv_blogs_id_fk"
FOREIGN KEY ("blog_id")
REFERENCES "public"."arnnvv_blogs"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "arnnvv_comments"
ADD CONSTRAINT "arnnvv_comments_user_id_arnnvv_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."arnnvv_users"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "arnnvv_comments"
ADD CONSTRAINT "arnnvv_comments_parent_comment_id_arnnvv_comments_id_fk"
FOREIGN KEY ("parent_comment_id")
REFERENCES "public"."arnnvv_comments"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "arnnvv_comment_likes"
ADD CONSTRAINT "arnnvv_comment_likes_user_id_arnnvv_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."arnnvv_users"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "arnnvv_comment_likes"
ADD CONSTRAINT "arnnvv_comment_likes_comment_id_arnnvv_comments_id_fk"
FOREIGN KEY ("comment_id")
REFERENCES "public"."arnnvv_comments"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

CREATE INDEX "session_user_id_idx"
ON "arnnvv_sessions" USING btree ("user_id");
CREATE INDEX "google_id_idx"
ON "arnnvv_users" USING btree ("google_id");
CREATE INDEX "email_idx"
ON "arnnvv_users" USING btree ("email");

CREATE INDEX "comment_blog_id_idx"
ON "arnnvv_comments" USING btree ("blog_id");
CREATE INDEX "comment_parent_comment_id_idx"
ON "arnnvv_comments" USING btree ("parent_comment_id")
WHERE "parent_comment_id" IS NOT NULL;
-- counting likes per comment
CREATE INDEX "comment_likes_comment_id_idx"
ON "arnnvv_comment_likes" USING btree ("comment_id");
