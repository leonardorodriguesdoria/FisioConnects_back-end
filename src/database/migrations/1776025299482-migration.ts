import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776025299482 implements MigrationInterface {
    name = 'Migration1776025299482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clinica" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "endereco" character varying NOT NULL, CONSTRAINT "PK_a5868356fca535972d7aa945704" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "clinica"`);
    }

}
