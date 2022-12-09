import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { setupApp } from "../../../appSetup";

import { TestModule } from "../../../shared/test/test.module";
import { TestService } from "../../../shared/test/test.service";
import { UserController } from "./user.controller";
import { UserModule } from "../user.module";
import { AuthModule } from "../../../features/auth/auth.module";

import { Role, User } from "../../../entities/User.entity";

import * as fixtures from "../../../shared/test/fixtures";

describe("UserController", () => {
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

    //// POST /user

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
            password: "passwordTest",
            role: Role.Buyer
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
            username: "test1",
            role: Role.Buyer
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(400);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterPasswordMissingError");
    });

    it("/POST user - should throw an error for a to short password", async () => {
        const registerBody = {
            username: "test1",
            password: "passw",
            role: Role.Buyer
        };

        const response = await request(app.getHttpServer()).post("/api/v1/user").send(registerBody).expect(400);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("RegisterPasswordToShortError");
    });

    it("/POST user - should throw an error for a to short username", async () => {
        const registerBody = {
            username: "te",
            password: "password",
            role: Role.Buyer
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

    //// PUT /user

    it("/PUT user - should update user1 username, password and role (to Seller)", async () => {
        const registerBody = {
            username: fixtures.user1.username + "-updated",
            password: "newPassword",
            role: Role.Seller
        };

        const userCountBefore = await User.count({ username: fixtures.user1.username });
        expect(userCountBefore).toEqual(1);

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(registerBody)
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("User1Updated");
    });

    it("/PUT user - should update user3 username, password and role (to Buyer)", async () => {
        const registerBody = {
            username: fixtures.user3.username + "-updated",
            password: "newPassword",
            role: Role.Buyer
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(registerBody)
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("User3Updated");
    });

    it("/PUT user - should throw an error for a username conflict", async () => {
        const registerBody = {
            username: fixtures.user3.username,
            password: "passwordTest",
            role: "buyer"
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(registerBody)
            .expect(409);

        const credentials = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(credentials).toMatchSnapshot("UpdateUsernameConflictError");
    });

    it("/PUT user - should throw an error for missing username", async () => {
        const registerBody = {
            password: "passwordTest",
            role: Role.Buyer
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(registerBody)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("UpdateUsernameMissingError");
    });

    it("/PUT user - should throw an error for missing role", async () => {
        const registerBody = {
            username: "test1",
            password: "passwordTest"
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(registerBody)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("UpdateRoleMissingError");
    });

    it("/PUT user - should throw an error for missing password", async () => {
        const registerBody = {
            username: "test1",
            role: Role.Buyer
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(registerBody)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("UpdatePasswordMissingError");
    });

    it("/PUT user - should throw an error for a to short password", async () => {
        const registerBody = {
            username: "test1",
            password: "passw",
            role: Role.Buyer
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(registerBody)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("UpdatePasswordToShortError");
    });

    it("/PUT user - should throw an error for a to short username", async () => {
        const registerBody = {
            username: "te",
            password: "password",
            role: Role.Buyer
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(registerBody)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("UpdateUsernameToShortError");
    });

    it("/PUT user - should throw an error for not supported role", async () => {
        const registerBody = {
            username: "test1",
            password: "passwordTest",
            role: "not-supported"
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(registerBody)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("UpdateRoleNotSupportedError");
    });

    //// GET /user

    it("/GET user - should return the public data of user1 (buyer)", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("User1PublicData");
    });

    it("/GET user - should return the public data of user3 (seller)", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/user")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("User3PublicData");
    });

    it("/GET user - should throw an error for no access", async () => {
        const response = await request(app.getHttpServer()).get("/api/v1/user").expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NoAccessError");
    });

    it("/GET user - should throw an error invalid token", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/user")
            .auth(fixtures.invalidAccessToken.token, { type: "bearer" })
            .expect(401);
        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("InvalidTokenError");
    });

    it("/GET user - should throw an already deleted user", async () => {
        await User.delete({ username: fixtures.user1.username });

        const response = await request(app.getHttpServer())
            .get("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("AlreadyDeletedError");
    });

    //// DELETE /user

    it("/DELETE user - should successful delete user1 (buyer)", async () => {
        const response = await request(app.getHttpServer())
            .delete("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("User1PublicData");
    });

    it("/DELETE user - should successful delete user3 (seller)", async () => {
        const response = await request(app.getHttpServer())
            .delete("/api/v1/user")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("User3PublicData");
    });

    it("/DELETE user - should throw an error for no access", async () => {
        const response = await request(app.getHttpServer()).delete("/api/v1/user").expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NoAccessError");
    });

    it("/DELETE user - should throw an error invalid token", async () => {
        const response = await request(app.getHttpServer())
            .delete("/api/v1/user")
            .auth(fixtures.invalidAccessToken.token, { type: "bearer" })
            .expect(401);
        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("InvalidTokenError");
    });

    it("/DELETE user - should throw an already deleted user", async () => {
        await User.delete({ username: fixtures.user1.username });

        const response = await request(app.getHttpServer())
            .delete("/api/v1/user")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("AlreadyDeletedError");
    });
});
