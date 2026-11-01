import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1793558081389 implements MigrationInterface {
    name = 'Migration1793558081389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "evolucao" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "medicalRecordId" integer, CONSTRAINT "PK_1b688715d4ea7752b55657031c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prontuario" ("id" SERIAL NOT NULL, "publicId" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "chiefComplaint" character varying NOT NULL, "diagnosis" character varying NOT NULL, "treatmentPlan" character varying NOT NULL, "observations" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, CONSTRAINT "UQ_854575156ef798c52a6dd281ed6" UNIQUE ("publicId"), CONSTRAINT "PK_26a7deec6e29f10efc3087ecbec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "paciente_clinico" ("id" SERIAL NOT NULL, "publicId" character varying(21) NOT NULL, "name" character varying NOT NULL, "birthday" TIMESTAMP NOT NULL, "gender" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying NOT NULL, "address" character varying NOT NULL, "profession" character varying NOT NULL, "nationality" character varying NOT NULL, "picture" character varying NOT NULL DEFAULT 'https://ibb.co/27mgpNMx', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "professionalId" integer, CONSTRAINT "UQ_502f66328d930dccd86a692e8d8" UNIQUE ("publicId"), CONSTRAINT "PK_459470bb7945621e87c969da67b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "avaliacao" ("id" SERIAL NOT NULL, "publicId" character varying NOT NULL, "rating" smallint NOT NULL, "comment" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, "professionalId" integer, CONSTRAINT "UQ_11b004a3ef06475fe64ebe87176" UNIQUE ("publicId"), CONSTRAINT "UQ_dc7d9f06241f583ee4a5a52ca35" UNIQUE ("patientId", "professionalId"), CONSTRAINT "CHK_e799e61e024e1d85dc00b693f4" CHECK ("rating" >= 1 AND "rating" <=5), CONSTRAINT "PK_fd3e156019eb4b68c6c9f746d51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favorito" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, "professionalId" integer, CONSTRAINT "UQ_6bdc6122276713226dcc2ba5d4d" UNIQUE ("patientId", "professionalId"), CONSTRAINT "PK_c165646ddc8ebc0ce44b842b3cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profissional" ("id" SERIAL NOT NULL, "publicId" character varying NOT NULL, "phone" character varying NOT NULL, "description" character varying NOT NULL, "specialties" text array NOT NULL, "city" character varying NOT NULL, "userId" integer, CONSTRAINT "UQ_3e98143e0e38326e3a75c1c54d3" UNIQUE ("publicId"), CONSTRAINT "UQ_68d8eb0b12fb9bc821a0e2b3db3" UNIQUE ("phone"), CONSTRAINT "REL_16eb10d858ba2ba7fe85a9962f" UNIQUE ("userId"), CONSTRAINT "PK_2e385f6afaa389d36d3d718536f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuário_role_enum" AS ENUM('PROFESSIONAL', 'PATIENT')`);
        await queryRunner.query(`CREATE TABLE "usuário" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."usuário_role_enum" NOT NULL, "profilePicture" character varying NOT NULL DEFAULT 'https://ibb.co/27mgpNMx', "profilePicturePublicId" character varying, "resetToken" character varying, "resetTokenExpiresAt" TIMESTAMP, "passwordChangedAt" TIMESTAMP, "accountStatus" character varying NOT NULL DEFAULT 'unverified', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78816b08e50af8e67f5567d1ad1" UNIQUE ("email"), CONSTRAINT "PK_bb25be09f6fece73c14c02615d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."otp_type_enum" AS ENUM('otp', 'reset_password')`);
        await queryRunner.query(`CREATE TABLE "otp" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "type" "public"."otp_type_enum" NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "evolucao" ADD CONSTRAINT "FK_64ad20ba4783ec4740fb3a9ec95" FOREIGN KEY ("medicalRecordId") REFERENCES "prontuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prontuario" ADD CONSTRAINT "FK_4db3e9abef3e56760f17f307f07" FOREIGN KEY ("patientId") REFERENCES "paciente_clinico"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "paciente_clinico" ADD CONSTRAINT "FK_1ccb8b3e4d7f76a3e841e860293" FOREIGN KEY ("professionalId") REFERENCES "profissional"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "avaliacao" ADD CONSTRAINT "FK_e91b4d567cddcea46a0db7f2da2" FOREIGN KEY ("patientId") REFERENCES "usuário"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "avaliacao" ADD CONSTRAINT "FK_d3f5d3613aa7bd3b2382b632273" FOREIGN KEY ("professionalId") REFERENCES "profissional"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorito" ADD CONSTRAINT "FK_af976080a3472d0902cf876d0cb" FOREIGN KEY ("patientId") REFERENCES "usuário"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorito" ADD CONSTRAINT "FK_3ebb42afd2ffdb695684c61f834" FOREIGN KEY ("professionalId") REFERENCES "profissional"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profissional" ADD CONSTRAINT "FK_16eb10d858ba2ba7fe85a9962fe" FOREIGN KEY ("userId") REFERENCES "usuário"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "otp" ADD CONSTRAINT "FK_db724db1bc3d94ad5ba38518433" FOREIGN KEY ("userId") REFERENCES "usuário"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" DROP CONSTRAINT "FK_db724db1bc3d94ad5ba38518433"`);
        await queryRunner.query(`ALTER TABLE "profissional" DROP CONSTRAINT "FK_16eb10d858ba2ba7fe85a9962fe"`);
        await queryRunner.query(`ALTER TABLE "favorito" DROP CONSTRAINT "FK_3ebb42afd2ffdb695684c61f834"`);
        await queryRunner.query(`ALTER TABLE "favorito" DROP CONSTRAINT "FK_af976080a3472d0902cf876d0cb"`);
        await queryRunner.query(`ALTER TABLE "avaliacao" DROP CONSTRAINT "FK_d3f5d3613aa7bd3b2382b632273"`);
        await queryRunner.query(`ALTER TABLE "avaliacao" DROP CONSTRAINT "FK_e91b4d567cddcea46a0db7f2da2"`);
        await queryRunner.query(`ALTER TABLE "paciente_clinico" DROP CONSTRAINT "FK_1ccb8b3e4d7f76a3e841e860293"`);
        await queryRunner.query(`ALTER TABLE "prontuario" DROP CONSTRAINT "FK_4db3e9abef3e56760f17f307f07"`);
        await queryRunner.query(`ALTER TABLE "evolucao" DROP CONSTRAINT "FK_64ad20ba4783ec4740fb3a9ec95"`);
        await queryRunner.query(`DROP TABLE "otp"`);
        await queryRunner.query(`DROP TYPE "public"."otp_type_enum"`);
        await queryRunner.query(`DROP TABLE "usuário"`);
        await queryRunner.query(`DROP TYPE "public"."usuário_role_enum"`);
        await queryRunner.query(`DROP TABLE "profissional"`);
        await queryRunner.query(`DROP TABLE "favorito"`);
        await queryRunner.query(`DROP TABLE "avaliacao"`);
        await queryRunner.query(`DROP TABLE "paciente_clinico"`);
        await queryRunner.query(`DROP TABLE "prontuario"`);
        await queryRunner.query(`DROP TABLE "evolucao"`);
    }

}
