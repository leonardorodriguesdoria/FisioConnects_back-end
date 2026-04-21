import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776645260955 implements MigrationInterface {
    name = 'Migration1776645260955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuário" DROP COLUMN "specialties"`);
        await queryRunner.query(`ALTER TABLE "usuário" ADD "specialties" text[] NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuário" DROP COLUMN "specialties"`);
        await queryRunner.query(`ALTER TABLE "usuário" ADD "specialties" text`);
    }

}
