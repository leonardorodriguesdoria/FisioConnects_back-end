import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790966491603 implements MigrationInterface {
    name = 'Migration1790966491603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "avaliacao" ("id" SERIAL NOT NULL, "publicId" character varying NOT NULL, "rating" smallint NOT NULL, "comment" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, "professionalId" integer, CONSTRAINT "UQ_11b004a3ef06475fe64ebe87176" UNIQUE ("publicId"), CONSTRAINT "UQ_dc7d9f06241f583ee4a5a52ca35" UNIQUE ("patientId", "professionalId"), CONSTRAINT "CHK_e799e61e024e1d85dc00b693f4" CHECK ("rating" >= 1 AND "rating" <=5), CONSTRAINT "PK_fd3e156019eb4b68c6c9f746d51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "avaliacao" ADD CONSTRAINT "FK_e91b4d567cddcea46a0db7f2da2" FOREIGN KEY ("patientId") REFERENCES "usuário"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "avaliacao" ADD CONSTRAINT "FK_d3f5d3613aa7bd3b2382b632273" FOREIGN KEY ("professionalId") REFERENCES "profissional"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avaliacao" DROP CONSTRAINT "FK_d3f5d3613aa7bd3b2382b632273"`);
        await queryRunner.query(`ALTER TABLE "avaliacao" DROP CONSTRAINT "FK_e91b4d567cddcea46a0db7f2da2"`);
        await queryRunner.query(`DROP TABLE "avaliacao"`);
    }

}
