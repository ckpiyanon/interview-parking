import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1719111325482 implements MigrationInterface {
  name = 'init1719111325482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "parks" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "description" text, "location" geometry(Point,4326) NOT NULL, "cost_description" text, "fixed_first_period" integer NOT NULL, "fixed_first_period_cost" numeric(10,2) NOT NULL DEFAULT '0', "hourly_cost" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "pk_park" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "buildings" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" SERIAL NOT NULL, "park_id" integer NOT NULL, "name" character varying(50) NOT NULL, "description" text, CONSTRAINT "pk_building" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "slot_fk_park_id_index" ON "buildings" ("park_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."slots_type_enum" AS ENUM('car', 'motorcycle', 'bicycle', 'large', 'xlarge')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."slots_status_enum" AS ENUM('vacant', 'occupied', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "slots" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" SERIAL NOT NULL, "building_id" integer NOT NULL, "label" character varying(50) NOT NULL, "floor" character varying(20) NOT NULL DEFAULT '1', "type" "public"."slots_type_enum" NOT NULL DEFAULT 'car', "status" "public"."slots_status_enum" NOT NULL DEFAULT 'vacant', CONSTRAINT "pk_slot" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "slot_fk_building_id_index" ON "slots" ("building_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bills" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" SERIAL NOT NULL, "slot_id" integer NOT NULL, "code" character varying(50) NOT NULL, "check_in_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "check_out_time" TIMESTAMP WITH TIME ZONE, "car_plate_number" character varying(20) NOT NULL, "car_plate_province" character varying(50) NOT NULL, "amount" numeric(10,2) NOT NULL, "discount" numeric(10,2) NOT NULL, CONSTRAINT "pk_bill" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "bill_fk_slot_id_index" ON "bills" ("slot_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "bill_code_index" ON "bills" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "bill_car_plate_number_index" ON "bills" ("car_plate_number") `,
    );
    await queryRunner.query(
      `ALTER TABLE "buildings" ADD CONSTRAINT "fk_building_park" FOREIGN KEY ("park_id") REFERENCES "parks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "slots" ADD CONSTRAINT "fk_slot_building" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bills" ADD CONSTRAINT "fk_bill_slot" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bills" DROP CONSTRAINT "fk_bill_slot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "slots" DROP CONSTRAINT "fk_slot_building"`,
    );
    await queryRunner.query(
      `ALTER TABLE "buildings" DROP CONSTRAINT "fk_building_park"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."bill_car_plate_number_index"`,
    );
    await queryRunner.query(`DROP INDEX "public"."bill_code_index"`);
    await queryRunner.query(`DROP INDEX "public"."bill_fk_slot_id_index"`);
    await queryRunner.query(`DROP TABLE "bills"`);
    await queryRunner.query(`DROP INDEX "public"."slot_fk_building_id_index"`);
    await queryRunner.query(`DROP TABLE "slots"`);
    await queryRunner.query(`DROP TYPE "public"."slots_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."slots_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."slot_fk_park_id_index"`);
    await queryRunner.query(`DROP TABLE "buildings"`);
    await queryRunner.query(`DROP TABLE "parks"`);
  }
}
