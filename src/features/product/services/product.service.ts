import { Repository } from "typeorm";
import { Injectable, Inject } from "@nestjs/common";

import { Product } from "../../../entities/Product.entity";
import { User } from "../../../entities/User.entity";

import CONFIG from "../../../config";

@Injectable()
export class ProductService {
    constructor(
        @Inject(CONFIG.database.defaultProductRepoName)
        private readonly productRepository: Repository<Product>
    ) {}

    async findOneProduct(uid: string): Promise<Product | undefined> {
        return this.productRepository.findOne({ uid });
    }

    async createProduct(seller: User, name: string, cost: number, amountAvailable: number): Promise<Product> {
        const product = new Product();

        product.productName = name;
        product.cost = cost;
        product.amountAvailable = amountAvailable;
        product.seller = seller;

        return this.productRepository.save(product);
    }

    async updateUser(
        product: Product,
        seller: User,
        name: string,
        cost: number,
        amountAvailable: number
    ): Promise<Product> {
        product.productName = name;
        product.cost = cost;
        product.amountAvailable = amountAvailable;
        product.seller = seller;

        return this.productRepository.save(product);
    }

    async deleteUser(product: Product): Promise<Product> {
        return this.productRepository.remove(product);
    }
}
