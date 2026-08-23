import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1786908471751 implements MigrationInterface {
    name = 'Migration1786908471751'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evolução" DROP CONSTRAINT "FK_52cfadbe520ac0f4a597ffec4b5"`);
        await queryRunner.query(`ALTER TABLE "profissional" DROP CONSTRAINT "FK_16eb10d858ba2ba7fe85a9962fe"`);
        await queryRunner.query(`ALTER TABLE "evolução" ADD CONSTRAINT "FK_52cfadbe520ac0f4a597ffec4b5" FOREIGN KEY ("medicalRecordId") REFERENCES "prontuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profissional" ADD CONSTRAINT "FK_16eb10d858ba2ba7fe85a9962fe" FOREIGN KEY ("userId") REFERENCES "usuário"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profissional" DROP CONSTRAINT "FK_16eb10d858ba2ba7fe85a9962fe"`);
        await queryRunner.query(`ALTER TABLE "evolução" DROP CONSTRAINT "FK_52cfadbe520ac0f4a597ffec4b5"`);
        await queryRunner.query(`ALTER TABLE "profissional" ADD CONSTRAINT "FK_16eb10d858ba2ba7fe85a9962fe" FOREIGN KEY ("userId") REFERENCES "usuário"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evolução" ADD CONSTRAINT "FK_52cfadbe520ac0f4a597ffec4b5" FOREIGN KEY ("medicalRecordId") REFERENCES "prontuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
