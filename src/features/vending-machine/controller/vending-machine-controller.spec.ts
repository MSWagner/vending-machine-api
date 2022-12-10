import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { setupApp } from "../../../appSetup";

import { TestModule } from "../../../shared/test/test.module";
import { TestService } from "../../../shared/test/test.service";
import { AuthModule } from "../../../features/auth/auth.module";
import { UserModule } from "../../../features/user/user.module";
import { ProductModule } from "../../../features/product/product.module";
import { User } from "../../../entities/User.entity";
import { VendigMachineController } from "./vending-machine-controller";
import { Product } from "../../../entities/Product.entity";

import * as fixtures from "../../../shared/test/fixtures";
import { BuyBody, VALID_COINS } from "./_types";

describe("VendigMachineController", () => {
    let app: INestApplication;
    let testService: TestService;
    let vendingMachineController: VendigMachineController;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VendigMachineController],
            imports: [TestModule, AuthModule, UserModule, ProductModule]
        }).compile();

        testService = module.get<TestService>(TestService);
        vendingMachineController = module.get<VendigMachineController>(VendigMachineController);

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

    //// POST /deposit

    it("/POST deposit - should deposit 10 coins for user1 (buyer)", async () => {
        const body = {
            coin: 10
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(body)
            .expect(200);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(10);
    });

    it("/POST deposit - should deposit a second coin after the first one for user1 (buyer)", async () => {
        const body = {
            coin: 10
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(body)
            .expect(200);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(body)
            .expect(200);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(10 + 10);
    });

    it("/POST deposit - should throw an error for an invalid coin", async () => {
        const body = {
            coin: 150
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        const response = await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(body)
            .expect(400);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(0);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NoValidCoinError");
    });

    it("/POST deposit - should throw an error for missing a coin", async () => {
        const body = {};

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        const response = await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(body)
            .expect(400);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(0);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("MissingCoinError");
    });

    it("/POST deposit - should throw an error for a seller deposit", async () => {
        const body = {
            coin: 10
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(body)
            .expect(403);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("SellerDepositError");
    });

    it("/POST deposit - should return an error for not authenticated", async () => {
        const body = {
            coin: 10
        };

        const response = await request(app.getHttpServer()).post("/api/v1/deposit").send(body).expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NotAuthenticatedResponse");
    });

    it("/POST deposit - should return an error for a seller request", async () => {
        const body = {
            coin: 10
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(body)
            .expect(403);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("SellerErrorResponse");
    });

    //// getChangeCoins

    it("getChangeCoins - should calculate the change coins for 245 change and all validCoins", async () => {
        const changeCoins = vendingMachineController.getChangeCoins(245, VALID_COINS);

        expect(changeCoins).toEqual([100, 100, 20, 20, 5]);
    });

    it("getChangeCoins - should calculate the change coins for 65 change and all validCoins", async () => {
        const changeCoins = vendingMachineController.getChangeCoins(65, VALID_COINS);

        expect(changeCoins).toEqual([50, 10, 5]);
    });

    it("getChangeCoins - should return an empty array for no change", async () => {
        const changeCoins = vendingMachineController.getChangeCoins(0, VALID_COINS);

        expect(changeCoins).toEqual([]);
    });

    //// POST /buy

    it("/POST buy - user1 should deposit 100 and buy product2 for 10 with a change of 90", async () => {
        const depositBody = {
            coin: 100
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(depositBody)
            .expect(200);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(100);

        const product1AmountBefore = await Product.findOne(fixtures.product2User3Seller.uid);
        expect(product1AmountBefore.amountAvailable).toEqual(1);

        const buyBody: BuyBody = {
            productUid: fixtures.product2User3Seller.uid,
            amount: 1
        };

        const buyResponse = await request(app.getHttpServer())
            .post("/api/v1/buy")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(buyBody)
            .expect(200);

        expect(buyResponse.body.change).toEqual([50, 20, 20]);
        expect(buyResponse.body.spent).toEqual(10);

        const product1AmountAfter = await Product.findOne(fixtures.product2User3Seller.uid);
        expect(product1AmountAfter.amountAvailable).toEqual(0);

        const user1After2 = await User.findOne(fixtures.user1.uid);
        expect(user1After2.deposit).toEqual(0);

        const responseData = testService.replaceValues(buyResponse.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("BuyProduct2SuccessfulResponse");
    });

    it("/POST buy - user1 should deposit 200 and buy 2 product1 for 200 with a change of 0", async () => {
        const depositBody = {
            coin: 100
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(depositBody)
            .expect(200);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(depositBody)
            .expect(200);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(200);

        const product1AmountBefore = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1AmountBefore.amountAvailable).toEqual(10);

        const buyBody: BuyBody = {
            productUid: fixtures.product1User3Seller.uid,
            amount: 2
        };

        const buyResponse = await request(app.getHttpServer())
            .post("/api/v1/buy")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(buyBody)
            .expect(200);

        expect(buyResponse.body.change).toEqual([]);
        expect(buyResponse.body.spent).toEqual(200);

        const product1AmountAfter = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1AmountAfter.amountAvailable).toEqual(8);

        const user1After2 = await User.findOne(fixtures.user1.uid);
        expect(user1After2.deposit).toEqual(0);

        const responseData = testService.replaceValues(buyResponse.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("BuyProduct1TwiceSuccessfulResponse");
    });

    it("/POST buy - should throw an error for not enough products available", async () => {
        const depositBody = {
            coin: 100
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(depositBody)
            .expect(200);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(100);

        const product1AmountBefore = await Product.findOne(fixtures.product2User3Seller.uid);
        expect(product1AmountBefore.amountAvailable).toEqual(1);

        const buyBody: BuyBody = {
            productUid: fixtures.product2User3Seller.uid,
            amount: 2
        };

        const buyResponse = await request(app.getHttpServer())
            .post("/api/v1/buy")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(buyBody)
            .expect(400);

        const product1AmountAfter = await Product.findOne(fixtures.product2User3Seller.uid);
        expect(product1AmountAfter.amountAvailable).toEqual(1);

        const user1After2 = await User.findOne(fixtures.user1.uid);
        expect(user1After2.deposit).toEqual(100);

        const responseData = testService.replaceValues(buyResponse.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NotEnoughProductsAvailableResponse");
    });

    it("/POST buy - should throw an error for not enough deposit", async () => {
        const depositBody = {
            coin: 100
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(depositBody)
            .expect(200);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(100);

        const product1AmountBefore = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1AmountBefore.amountAvailable).toEqual(10);

        const buyBody: BuyBody = {
            productUid: fixtures.product1User3Seller.uid,
            amount: 2
        };

        const buyResponse = await request(app.getHttpServer())
            .post("/api/v1/buy")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(buyBody)
            .expect(400);

        const product1AmountAfter = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1AmountAfter.amountAvailable).toEqual(10);

        const user1After2 = await User.findOne(fixtures.user1.uid);
        expect(user1After2.deposit).toEqual(100);

        const responseData = testService.replaceValues(buyResponse.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NotEnoughDepositResponse");
    });

    it("/POST buy - should throw an error for product not found", async () => {
        const depositBody = {
            coin: 100
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(depositBody)
            .expect(200);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(100);

        const product1AmountBefore = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1AmountBefore.amountAvailable).toEqual(10);

        const buyBody: BuyBody = {
            productUid: "b94f76b3-c60c-43b6-b479-1dbc37bb805d",
            amount: 2
        };

        const buyResponse = await request(app.getHttpServer())
            .post("/api/v1/buy")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(buyBody)
            .expect(404);

        const product1AmountAfter = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1AmountAfter.amountAvailable).toEqual(10);

        const user1After2 = await User.findOne(fixtures.user1.uid);
        expect(user1After2.deposit).toEqual(100);

        const responseData = testService.replaceValues(buyResponse.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("ProductNotFoundResponse");
    });

    it("/POST buy - should return an error for not authenticated", async () => {
        const buyBody: BuyBody = {
            productUid: "b94f76b3-c60c-43b6-b479-1dbc37bb805d",
            amount: 2
        };

        const response = await request(app.getHttpServer()).post("/api/v1/buy").send(buyBody).expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NotAuthenticatedResponse");
    });

    it("/POST buy - should return an error for a seller request", async () => {
        const buyBody: BuyBody = {
            productUid: "b94f76b3-c60c-43b6-b479-1dbc37bb805d",
            amount: 2
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/buy")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(buyBody)
            .expect(403);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("SellerErrorResponse");
    });

    //// POST /reset

    it("/POST reset - should reset the deposit of user1", async () => {
        const body = {
            coin: 10
        };

        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        await request(app.getHttpServer())
            .post("/api/v1/deposit")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(body)
            .expect(200);

        const user1After = await User.findOne(fixtures.user1.uid);
        expect(user1After.deposit).toEqual(10);

        const response = await request(app.getHttpServer())
            .post("/api/v1/reset")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .expect(200);

        expect(response.body.change).toEqual([10]);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("ResetDeposit10Response");
    });

    it("/POST reset - should return an empty array for no deposit", async () => {
        const user1Before = await User.findOne(fixtures.user1.uid);
        expect(user1Before.deposit).toEqual(0);

        const response = await request(app.getHttpServer())
            .post("/api/v1/reset")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .expect(200);

        expect(response.body.change).toEqual([]);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("ResetDeposit0Response");
    });

    it("/POST reset - should return an error for not authenticated", async () => {
        const response = await request(app.getHttpServer()).post("/api/v1/reset").expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NotAuthenticatedResponse");
    });

    it("/POST reset - should return an error for a seller request", async () => {
        const response = await request(app.getHttpServer())
            .post("/api/v1/reset")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .expect(403);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("SellerErrorResponse");
    });
});
