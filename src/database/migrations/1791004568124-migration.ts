import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1791004568124 implements MigrationInterface {
    name = 'Migration1791004568124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profissional" ADD "publicId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profissional" ADD CONSTRAINT "UQ_3e98143e0e38326e3a75c1c54d3" UNIQUE ("publicId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profissional" DROP CONSTRAINT "UQ_3e98143e0e38326e3a75c1c54d3"`);
        await queryRunner.query(`ALTER TABLE "profissional" DROP COLUMN "publicId"`);
    }

}
