import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1791835123471 implements MigrationInterface {
    name = 'Migration1791835123471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuário" ADD "profilePicturePublicId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuário" DROP COLUMN "profilePicturePublicId"`);
    }

}
