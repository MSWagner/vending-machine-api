import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthModule } from "./features/auth/auth.module";
import { ProductModule } from "./features/product/product.module";
import { UserApiModule } from "./features/user/user-api-module";
import { VendingMachineModule } from "./features/vending-machine/vending-machine.module";

import { DatabaseModule } from "./shared/database/database.module";

@Module({
    imports: [DatabaseModule, AuthModule, UserApiModule, ProductModule, VendingMachineModule],
    providers: [AppService]
})
export class AppModule {}
