import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782334519333 implements MigrationInterface {
    name = 'Migration1782334519333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paciente" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "usuário" ALTER COLUMN "specialties" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuário" ALTER COLUMN "specialties" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "paciente" ADD "age" integer NOT NULL`);
    }

}
