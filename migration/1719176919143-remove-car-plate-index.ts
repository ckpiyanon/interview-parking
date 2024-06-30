import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCarPlateIndex1719176919143 implements MigrationInterface {
  name = 'RemoveCarPlateIndex1719176919143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."bill_car_plate_number_index"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "bill_car_plate_number_index" ON "bills" ("car_plate_number") `,
    );
  }
}
