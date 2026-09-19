import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1789330299408 implements MigrationInterface {
    name = 'Migration1789330299408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "evolucao" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "medicalRecordId" integer, CONSTRAINT "PK_1b688715d4ea7752b55657031c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "evolucao" ADD CONSTRAINT "FK_64ad20ba4783ec4740fb3a9ec95" FOREIGN KEY ("medicalRecordId") REFERENCES "prontuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evolucao" DROP CONSTRAINT "FK_64ad20ba4783ec4740fb3a9ec95"`);
        await queryRunner.query(`DROP TABLE "evolucao"`);
    }

}
