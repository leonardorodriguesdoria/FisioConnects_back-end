import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1781986448247 implements MigrationInterface {
    name = 'Migration1781986448247'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "paciente" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "age" integer NOT NULL, "birthday" TIMESTAMP NOT NULL, "gender" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying NOT NULL, "professionalId" integer, CONSTRAINT "PK_cbcb7985432e4b49d32c5243867" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prontuario" ("id" SERIAL NOT NULL, "diagnosis" character varying NOT NULL, "plan" character varying NOT NULL, "observations" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, CONSTRAINT "PK_26a7deec6e29f10efc3087ecbec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evolução" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, CONSTRAINT "PK_a48686ea6707e55c804e0e3b5b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "paciente" ADD CONSTRAINT "FK_0c9b19efd02f1bbcb8cacf56c5c" FOREIGN KEY ("professionalId") REFERENCES "usuário"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prontuario" ADD CONSTRAINT "FK_4db3e9abef3e56760f17f307f07" FOREIGN KEY ("patientId") REFERENCES "paciente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evolução" ADD CONSTRAINT "FK_84a36077ad2418273da94cf4b50" FOREIGN KEY ("patientId") REFERENCES "paciente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evolução" DROP CONSTRAINT "FK_84a36077ad2418273da94cf4b50"`);
        await queryRunner.query(`ALTER TABLE "prontuario" DROP CONSTRAINT "FK_4db3e9abef3e56760f17f307f07"`);
        await queryRunner.query(`ALTER TABLE "paciente" DROP CONSTRAINT "FK_0c9b19efd02f1bbcb8cacf56c5c"`);
        await queryRunner.query(`DROP TABLE "evolução"`);
        await queryRunner.query(`DROP TABLE "prontuario"`);
        await queryRunner.query(`DROP TABLE "paciente"`);
    }

}
