import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1791064443418 implements MigrationInterface {
    name = 'Migration1791064443418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avaliacao" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avaliacao" DROP COLUMN "updatedAt"`);
    }

}
