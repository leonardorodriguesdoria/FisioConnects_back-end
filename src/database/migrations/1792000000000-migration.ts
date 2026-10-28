import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1792000000000 implements MigrationInterface {
    name = 'Migration1792000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuário" ADD "passwordChangedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuário" DROP COLUMN "passwordChangedAt"`);
    }

}
