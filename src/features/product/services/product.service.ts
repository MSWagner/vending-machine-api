import { Repository } from "typeorm";
import { Injectable, Inject } from "@nestjs/common";

import { Product } from "../../../entities/Product.entity";
import { User } from "../../../entities/User.entity";
import { ProductUpsertDto } from "../dto/product.dto";

import CONFIG from "../../../config";

@Injectable()
export class ProductService {
    constructor(
        @Inject(CONFIG.database.defaultProductRepoName)
        private readonly productRepository: Repository<Product>
    ) {}

    async findAll(): Promise<Product[]> {
        return this.productRepository.find();
    }

    async findOne(uid: string): Promise<Product | undefined> {
        return this.productRepository.findOne({ where: { uid }, relations: ["seller"] });
    }

    async create(seller: User, upsertDto: ProductUpsertDto): Promise<Product> {
        const product = new Product();

        product.productName = upsertDto.productName;
        product.cost = upsertDto.cost;
        product.amountAvailable = upsertDto.amountAvailable;
        product.seller = seller;

        return this.productRepository.save(product);
    }

    async update(product: Product, seller: User, upsertDto: ProductUpsertDto): Promise<Product> {
        product.productName = upsertDto.productName;
        product.cost = upsertDto.cost;
        product.amountAvailable = upsertDto.amountAvailable;
        product.seller = seller;

        return this.productRepository.save(product);
    }

    async delete(product: Product): Promise<Product> {
        return this.productRepository.remove(product);
    }
}
