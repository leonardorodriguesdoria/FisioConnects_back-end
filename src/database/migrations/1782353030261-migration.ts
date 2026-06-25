import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782353030261 implements MigrationInterface {
    name = 'Migration1782353030261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paciente" ADD CONSTRAINT "UQ_13febbda8e5f7ba008e82e4deaa" UNIQUE ("phone")`);
        await queryRunner.query(`ALTER TABLE "usuário" ADD CONSTRAINT "UQ_e0e67b4004f5ca69641f9084d8e" UNIQUE ("phone")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuário" DROP CONSTRAINT "UQ_e0e67b4004f5ca69641f9084d8e"`);
        await queryRunner.query(`ALTER TABLE "paciente" DROP CONSTRAINT "UQ_13febbda8e5f7ba008e82e4deaa"`);
    }

}
