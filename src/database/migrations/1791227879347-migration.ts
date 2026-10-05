import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1791227879347 implements MigrationInterface {
    name = 'Migration1791227879347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favorito" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, "professionalId" integer, CONSTRAINT "UQ_6bdc6122276713226dcc2ba5d4d" UNIQUE ("patientId", "professionalId"), CONSTRAINT "PK_c165646ddc8ebc0ce44b842b3cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "favorito" ADD CONSTRAINT "FK_af976080a3472d0902cf876d0cb" FOREIGN KEY ("patientId") REFERENCES "usuário"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorito" ADD CONSTRAINT "FK_3ebb42afd2ffdb695684c61f834" FOREIGN KEY ("professionalId") REFERENCES "profissional"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorito" DROP CONSTRAINT "FK_3ebb42afd2ffdb695684c61f834"`);
        await queryRunner.query(`ALTER TABLE "favorito" DROP CONSTRAINT "FK_af976080a3472d0902cf876d0cb"`);
        await queryRunner.query(`DROP TABLE "favorito"`);
    }

}
