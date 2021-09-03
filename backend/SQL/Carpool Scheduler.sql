CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "firstname" varchar NOT NULL,
  "lastname" varchar NOT NULL,
  "password" varchar NOT NULL,
  "type" varchar NOT NULL,
  "carspace" int,
  "schedule_id" int
);

CREATE TABLE "groups" (
  "id" SERIAL PRIMARY KEY,
  "group_id_suffix" int UNIQUE,
  "groupname" varchar,
  "user_id" int
);

CREATE TABLE "user_schedules" (
  "id" SERIAL PRIMARY KEY,
  "day" varchar,
  "to_campus" time NOT NULL,
  "from_campus" time NOT NULL
);

CREATE TABLE "driver_carpool_schedules" (
  "id" SERIAL PRIMARY KEY,
  "driver_id" int,
  "carpooler_id" int,
  "schedule_id" int
);

ALTER TABLE "users" ADD FOREIGN KEY ("schedule_id") REFERENCES "user_schedules" ("id");

ALTER TABLE "groups" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "driver_carpool_schedules" ADD FOREIGN KEY ("driver_id") REFERENCES "users" ("id");

ALTER TABLE "driver_carpool_schedules" ADD FOREIGN KEY ("carpooler_id") REFERENCES "users" ("id");

ALTER TABLE "driver_carpool_schedules" ADD FOREIGN KEY ("schedule_id") REFERENCES "user_schedules" ("id");

COMMENT ON COLUMN "users"."type" IS 'driver or carpooler';

COMMENT ON COLUMN "users"."carspace" IS 'for drivers only; number of seats available, excluding driver';

COMMENT ON COLUMN "user_schedules"."day" IS 'Mon, Tues, Wed, Thurs, or Fri';
