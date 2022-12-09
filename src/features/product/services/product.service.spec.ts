import { Test, TestingModule } from "@nestjs/testing";

import { TestModule } from "../../../shared/test/test.module";
import { TestService } from "../../../shared/test/test.service";

import { ProductService } from "./product.service";
import { productProviders } from "../product.providers";
import { Product } from "../../../entities/Product.entity";

import { User } from "../../../entities/User.entity";
import { UserModule } from "../../../features/user/user.module";

import * as fixtures from "../../../shared/test/fixtures";

describe("ProductService", () => {
    let service: ProductService;
    let testService: TestService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestModule, UserModule],
            providers: [...productProviders, ProductService]
        }).compile();

        service = module.get<ProductService>(ProductService);
        testService = module.get<TestService>(TestService);

        await testService.reloadFixtures();
    });

    afterAll((done) => {
        testService.connectionManager.connection.close();
        done();
    });

    it("should find product1", async () => {
        const product1 = await service.findOneProduct(fixtures.product1User3Seller.uid);

        expect(product1.uid).toEqual(fixtures.product1User3Seller.uid);
    });

    it("should not find some product with unknown product uuid", async () => {
        const user = await service.findOneProduct("ad9ee500-c03e-4d4e-9ef2-3669ab17b023");

        expect(user).toBeUndefined();
    });

    it("should create a new product", async () => {
        const seller = await User.findOne(fixtures.user3.uid);

        const productCountBefore = await Product.count({ where: { productName: "testProduct1" } });
        expect(productCountBefore).toEqual(0);

        const newProduct = await service.createProduct(seller, "testProduct1", 10, 100);
        expect(newProduct.productName).toEqual("testProduct1");
        expect(newProduct.cost).toEqual(10);
        expect(newProduct.amountAvailable).toEqual(100);
        expect(newProduct.seller.username).toEqual(seller.username);

        const productCountAfter = await Product.count({ where: { productName: "testProduct1" } });
        expect(productCountAfter).toEqual(1);
    });

    it("should update a product", async () => {
        const product1 = await Product.findOne(fixtures.product1User3Seller.uid);
        const seller = await User.findOne(fixtures.user3.uid);

        const productCountBefore = await Product.count({ where: { productName: "testProduct1" } });
        expect(productCountBefore).toEqual(0);

        const newProduct = await service.updateUser(product1, seller, "testProduct1Updated", 20, 200);
        expect(newProduct.uid).toEqual(product1.uid);
        expect(newProduct.productName).toEqual("testProduct1Updated");
        expect(newProduct.cost).toEqual(20);
        expect(newProduct.amountAvailable).toEqual(200);
        expect(newProduct.seller.username).toEqual(seller.username);

        const productCountAfter = await Product.count({ where: { productName: "testProduct1Updated" } });
        expect(productCountAfter).toEqual(1);
    });

    it("should delete product1", async () => {
        const product1 = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(product1).not.toBeUndefined();

        await service.deleteUser(product1);

        const removedProduct = await Product.findOne(fixtures.product1User3Seller.uid);
        expect(removedProduct).toBeUndefined();
    });
});
