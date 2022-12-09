import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1670589739751 implements MigrationInterface {
    name = "Init1670589739751";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "access_token" ("token" uuid NOT NULL DEFAULT uuid_generate_v4(), "validUntil" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userUid" uuid NOT NULL, CONSTRAINT "PK_70ba8f6af34bc924fc9e12adb8f" PRIMARY KEY ("token"))`
        );
        await queryRunner.query(
            `CREATE TABLE "user" ("uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "passwordHash" text, "isActive" boolean NOT NULL DEFAULT false, "deposit" integer NOT NULL DEFAULT '0', "role" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_df955cae05f17b2bcf5045cc021" PRIMARY KEY ("uid"))`
        );
        await queryRunner.query(
            `CREATE TABLE "refresh_token" ("token" uuid NOT NULL DEFAULT uuid_generate_v4(), "validUntil" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userUid" uuid NOT NULL, CONSTRAINT "PK_c31d0a2f38e6e99110df62ab0af" PRIMARY KEY ("token"))`
        );
        await queryRunner.query(
            `ALTER TABLE "access_token" ADD CONSTRAINT "FK_70fbc98188d25e34238ffd699b0" FOREIGN KEY ("userUid") REFERENCES "user"("uid") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_e0fe4fa46c0ec1b9f7232c47e05" FOREIGN KEY ("userUid") REFERENCES "user"("uid") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_e0fe4fa46c0ec1b9f7232c47e05"`);
        await queryRunner.query(`ALTER TABLE "access_token" DROP CONSTRAINT "FK_70fbc98188d25e34238ffd699b0"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "access_token"`);
    }
}
