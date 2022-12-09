import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { setupApp } from "../../../appSetup";

import { TestModule } from "../../../shared/test/test.module";
import { TestService } from "../../../shared/test/test.service";
import { AuthModule } from "../../../features/auth/auth.module";
import { UserModule } from "../../../features/user/user.module";
import { ProductController } from "./product.controller";
import { ProductUpsertDto } from "../dto/product.dto";
import { Product } from "../../../entities/Product.entity";
import { ProductService } from "../services/product.service";
import { productProviders } from "../product.providers";

import * as fixtures from "../../../shared/test/fixtures";

describe("ProductController", () => {
    let app: INestApplication;
    let testService: TestService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [...productProviders, ProductService],
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

    //// POST /products

    it("/POST products - should create a new product for a authenticated seller", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 25,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(201);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NewProduct1CreatedResponse");
    });

    it("/POST products - should throw an error for unauthorized requests", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 25,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer()).post("/api/v1/products").send(newProduct).expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("UnauthorizedPostError");
    });

    it("/POST products - should throw an error for authentictated buyer requests", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 25,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/products")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(newProduct)
            .expect(403);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("BuyerPostError");
    });

    it("/POST products - should throw an error for missing productName", async () => {
        const newProduct = {
            cost: 25,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("ProductNameMissingPostError");
    });

    it("/POST products - should throw an error for missing cost", async () => {
        const newProduct = {
            productName: "newProduct1",
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("CostMissingPostError");
    });

    it("/POST products - should throw an error for missing amountAvailable", async () => {
        const newProduct = {
            productName: "newProduct1",
            cost: 25
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("AmountAvailableMissingPostError");
    });

    it("/POST products - should throw an error for cost is not be in multiples of 5", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 7,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("CostNotMultipleOf5PostError");
    });

    it("/POST products - should throw an error for cost is to low", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 0,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("CostToLowPostError");
    });

    it("/POST products - should throw an error for amountAvailable is to low", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 5,
            amountAvailable: -1
        };

        const response = await request(app.getHttpServer())
            .post("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("amountAvailableLowPostError");
    });

    //// GET /products

    it("/GET products - should return all products for unauthenticated users", async () => {
        const response = await request(app.getHttpServer()).get("/api/v1/products").expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("AllProductsResponse");
    });

    it("/GET products - should return all products for buyer users", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/products")
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("AllProductsResponse");
    });

    it("/GET products - should return all products for seller users", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("AllProductsResponse");
    });

    it("/GET products - should return an empty array if no products available", async () => {
        await Product.clear();
        const allProductCount = await Product.count();
        expect(allProductCount).toBe(0);

        const response = await request(app.getHttpServer())
            .get("/api/v1/products")
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("EmptyProductsResponse");
    });

    //// GET /products/:uid

    it("/GET products/:uid - should return products1 for unauthenticated users", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("Product1Response");
    });

    it("/GET products/:uid - should return products1 for buyer users", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("Product1Response");
    });

    it("/GET products/:uid - should return products1 for seller users", async () => {
        const response = await request(app.getHttpServer())
            .get("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("Product1Response");
    });

    it("/GET products/:uid - should throw an 404 error for not found product", async () => {
        await Product.clear();
        const allProductCount = await Product.count();
        expect(allProductCount).toBe(0);

        const response = await request(app.getHttpServer())
            .get("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .expect(404);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("ErrorProductNotFoundResponse");
    });

    //// PUT /products/uid

    it("/PUT products/uid - should update a product1 from user3 (seller)", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1Name",
            cost: 25,
            amountAvailable: 9
        };

        const product1Before = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1Before).not.toBeNull();
        expect(product1Before.productName).not.toBe(newProduct.productName);
        expect(product1Before.cost).not.toBe(newProduct.cost);
        expect(product1Before.amountAvailable).not.toBe(newProduct.amountAvailable);

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(200);

        const product1After = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1After).not.toBeNull();
        expect(product1After.productName).toBe(newProduct.productName);
        expect(product1After.cost).toBe(newProduct.cost);
        expect(product1After.amountAvailable).toBe(newProduct.amountAvailable);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NewProduct1UpdatedResponse");
    });

    it("/PUT products/uid  - should throw an error for unauthorized requests", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 25,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .send(newProduct)
            .expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("UnauthorizedPutError");
    });

    it("/PUT products/uid  - should throw an error for authentictated buyer requests", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 25,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessToken1.token, { type: "bearer" })
            .send(newProduct)
            .expect(403);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("BuyerPutError");
    });

    it("/PUT products/uid - should throw an error for missing productName", async () => {
        const newProduct = {
            cost: 25,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("ProductNameMissingPutError");
    });

    it("/PUT products/uid - should throw an error for missing cost", async () => {
        const newProduct = {
            productName: "newProduct1",
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("CostMissingPutError");
    });

    it("/PUT products/uid - should throw an error for missing amountAvailable", async () => {
        const newProduct = {
            productName: "newProduct1",
            cost: 25
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("AmountAvailableMissingPutError");
    });

    it("/PUT products/uid - should throw an error for cost is not be in multiples of 5", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 7,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("CostNotMultipleOf5PutError");
    });

    it("/PUT products/uid - should throw an error for cost is to low", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 0,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("CostToLowPutError");
    });

    it("/PUT products/uid - should throw an error for amountAvailable is to low", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 5,
            amountAvailable: -1
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(400);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("amountAvailableLowPutError");
    });

    it("/PUT products/uid  - should throw an error for a not owner seller requests", async () => {
        const newProduct: ProductUpsertDto = {
            productName: "newProduct1",
            cost: 25,
            amountAvailable: 9
        };

        const response = await request(app.getHttpServer())
            .put("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser4Seller.token, { type: "bearer" })
            .send(newProduct)
            .expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NotOwnerPutError");
    });

    //// DELETE /products/uid

    it("/DELETE products/uid - should successful delete product1", async () => {
        const response = await request(app.getHttpServer())
            .delete("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser3Seller.token, { type: "bearer" })
            .expect(200);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("DeleteProduct1");
    });

    it("/DELETE products/uid - should throw an error for no access", async () => {
        const response = await request(app.getHttpServer())
            .delete("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .expect(401);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NoAccessError");
    });

    it("/DELETE products/uid - should throw an not owner request", async () => {
        const response = await request(app.getHttpServer())
            .delete("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser4Seller.token, { type: "bearer" })
            .expect(401);
        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("NotOwnerDeleteError");
    });

    it("/DELETE user - should throw an already deleted product", async () => {
        await Product.delete({ uid: fixtures.product1User3Seller.uid });

        const response = await request(app.getHttpServer())
            .delete("/api/v1/products/" + fixtures.product1User3Seller.uid)
            .auth(fixtures.accessTokenUser4Seller.token, { type: "bearer" })
            .expect(404);

        const responseData = testService.replaceValues(response.body, ["UUID", "DATE"]);
        expect(responseData).toMatchSnapshot("AlreadyDeletedError");
    });
});
