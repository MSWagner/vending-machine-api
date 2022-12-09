import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { setupApp } from "../../../appSetup";

import { TestModule } from "../../../shared/test/test.module";
import { TestService } from "../../../shared/test/test.service";
import { UserController } from "./user.controller";
import { UserModule } from "../user.module";
import { AuthModule } from "../../../features/auth/auth.module";

import { User } from "../../../entities/User.entity";

import * as fixtures from "../../../shared/test/fixtures";

describe("User Controller", () => {
    let app: INestApplication;
    let testService: TestService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            imports: [TestModule, AuthModule, UserModule]
        }).compile();

        testService = module.get<TestService>(TestService);

        app = module.createNestApplication();
        await setupApp(app);
        await app.init();
    });

    beforeEach(async () => {
        await testService.reloadFixtures();
    });

    afterAll((done) => {
        testService.connectionManager.connection.close();
        done();
    });

    it("/POST user - should register an new buyer user", async () => {
        const registerBody = {
            username: "test1",
            password: "passwordTest",
            role: "buyer"
        };

        const userCountBefore = await User.count({ username: registerBody.username });
        expect(userCountBefore).toEqual(0);

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(201);

        const userCountAfter = await User.count({ username: registerBody.username });
        expect(userCountAfter).toEqual(1);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterCredentials");
    });

    it("/POST user - should throw an error for a username conflict", async () => {
        const registerBody = {
            username: fixtures.user1.username,
            password: "passwordTest",
            role: "buyer"
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(409);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterUsernameConflictError");
    });

    it("/POST user - should throw an error for missing username", async () => {
        const registerBody = {
            password: "passwordTest"
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(400);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterUsernameMissingError");
    });

    it("/POST user - should throw an error for missing role", async () => {
        const registerBody = {
            username: "test1",
            password: "passwordTest"
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(400);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterRoleMissingError");
    });

    it("/POST user - should throw an error for missing password", async () => {
        const registerBody = {
            username: "test1"
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(400);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterPasswordMissingError");
    });

    it("/POST user - should throw an error for a to short password", async () => {
        const registerBody = {
            username: "test1",
            password: "passw"
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(400);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterPasswordToShortError");
    });

    it("/POST user - should throw an error for a to short username", async () => {
        const registerBody = {
            username: "te",
            password: "password"
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(400);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterUsernameToShortError");
    });

    it("/POST user - should throw an error for not supported role", async () => {
        const registerBody = {
            username: "test1",
            password: "passwordTest",
            role: "not-supported"
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(400);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterRoleNotSupportedError");
    });
});
