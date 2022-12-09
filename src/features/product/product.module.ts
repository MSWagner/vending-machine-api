import { Module } from "@nestjs/common";
import { ProductService } from "./services/product.service";
import { productProviders } from "./product.providers";

import { DatabaseModule } from "../../shared/database/database.module";
import { UserModule } from "../user/user.module";

@Module({
    imports: [DatabaseModule, UserModule],
    providers: [...productProviders, ProductService],
    exports: [DatabaseModule, ProductService, ...productProviders]
})
export class ProductModule {}
