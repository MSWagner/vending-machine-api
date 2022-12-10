import { Module } from "@nestjs/common";
import { ProductService } from "./services/product.service";
import { productProviders } from "./product.providers";

import { DatabaseModule } from "../../shared/database/database.module";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { ProductController } from "./controller/product.controller";

@Module({
    imports: [DatabaseModule, UserModule, AuthModule],
    providers: [...productProviders, ProductService],
    controllers: [ProductController],
    exports: [DatabaseModule, ProductService, ...productProviders]
})
export class ProductModule {}
