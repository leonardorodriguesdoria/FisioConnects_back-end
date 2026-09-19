import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1789837895012 implements MigrationInterface {
    name = 'Migration1789837895012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prontuario" ADD "publicId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "prontuario" ADD CONSTRAINT "UQ_854575156ef798c52a6dd281ed6" UNIQUE ("publicId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prontuario" DROP CONSTRAINT "UQ_854575156ef798c52a6dd281ed6"`);
        await queryRunner.query(`ALTER TABLE "prontuario" DROP COLUMN "publicId"`);
    }

}
