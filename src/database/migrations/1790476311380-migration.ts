import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790476311380 implements MigrationInterface {
    name = 'Migration1790476311380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evolucao" DROP CONSTRAINT "UQ_bbc36bd3c32cc12ad235af09257"`);
        await queryRunner.query(`ALTER TABLE "evolucao" DROP COLUMN "publicId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evolucao" ADD "publicId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evolucao" ADD CONSTRAINT "UQ_bbc36bd3c32cc12ad235af09257" UNIQUE ("publicId")`);
    }

}
