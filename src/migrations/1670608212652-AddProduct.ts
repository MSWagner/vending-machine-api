import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProduct1670608212652 implements MigrationInterface {
    name = "AddProduct1670608212652";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "product" ("uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "productName" text NOT NULL, "cost" integer NOT NULL, "amountAvailable" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sellerUid" uuid NOT NULL, CONSTRAINT "PK_45f791c6b86ce1dd9b9838cede4" PRIMARY KEY ("uid"))`
        );
        await queryRunner.query(
            `ALTER TABLE "product" ADD CONSTRAINT "FK_11cab522462095d55ecf4aaf8f1" FOREIGN KEY ("sellerUid") REFERENCES "user"("uid") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_11cab522462095d55ecf4aaf8f1"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }
}
