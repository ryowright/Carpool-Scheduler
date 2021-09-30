DROP TABLE IF EXISTS USERS CASCADE;
DROP TABLE IF EXISTS PASSWORD_CHANGE_REQUESTS CASCADE;
DROP TABLE IF EXISTS USER_SESSION_TOKENS CASCADE;
DROP TABLE IF EXISTS GROUPS CASCADE;
DROP TABLE IF EXISTS GROUP_REQUESTS CASCADE;
DROP TABLE IF EXISTS USER_SCHEDULES CASCADE;
DROP TABLE IF EXISTS DRIVER_CARPOOL_SCHEDULES CASCADE;

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "username" varchar UNIQUE NOT NULL,
  "firstname" varchar NOT NULL,
  "lastname" varchar NOT NULL,
  "password" varchar NOT NULL,
  "driver" boolean DEFAULT 'false',
  "carspace" int,
  "school" varchar NOT NULL,
  "email_token" varchar,
  "group_id" int,
  "admin" boolean DEFAULT 'false',
  "is_verified" boolean DEFAULT 'false'
);

CREATE TABLE "password_change_requests" (
  "id" SERIAL PRIMARY KEY,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "user_id" int NOT NULL,
  "reset_token" varchar
);

CREATE TABLE "user_session_tokens" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "session_token" varchar
);

CREATE TABLE "groups" (
  "id" SERIAL PRIMARY KEY,
  "group_id_suffix" int NOT NULL,
  "group_name" varchar NOT NULL,
  "description" varchar,
  "privacy" varchar NOT NULL DEFAULT 'locked',
  "group_token" varchar NOT NULL
);

CREATE TABLE "group_requests" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "group_id" int
);

CREATE TABLE "user_daily_schedules" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int NOT NULL,
  "day" varchar,
  "flexibility_early" int,
  "flexibility_late" int,
  "to_campus" time NOT NULL,
  "from_campus" time NOT NULL,
);

CREATE TABLE "driver_carpool_schedules" (
  "id" SERIAL PRIMARY KEY,
  "driver_id" int,
  "carpooler_id" int,
  "schedule_id" int
);

-- ALTER TABLE "users" ADD FOREIGN KEY ("schedule_id") REFERENCES "user_schedules" ("id");

ALTER TABLE "users" ADD FOREIGN KEY ("group_id") REFERENCES "groups" ("id");

ALTER TABLE "password_change_requests" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_session_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "group_requests" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "group_requests" ADD FOREIGN KEY ("group_id") REFERENCES "groups" ("id");

ALTER TABLE "user_schedules" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- ALTER TABLE "user_schedules" ADD FOREIGN KEY ("group_id") REFERENCES "groups" ("id");

ALTER TABLE "driver_carpool_schedules" ADD FOREIGN KEY ("driver_id") REFERENCES "users" ("id");

ALTER TABLE "driver_carpool_schedules" ADD FOREIGN KEY ("carpooler_id") REFERENCES "users" ("id");

ALTER TABLE "driver_carpool_schedules" ADD FOREIGN KEY ("schedule_id") REFERENCES "user_schedules" ("id");

COMMENT ON COLUMN "users"."type" IS 'driver or carpooler';

COMMENT ON COLUMN "users"."carspace" IS 'for drivers only; number of seats available, excluding driver';

COMMENT ON COLUMN "user_schedules"."day" IS 'Mon, Tues, Wed, Thurs, or Fri';
