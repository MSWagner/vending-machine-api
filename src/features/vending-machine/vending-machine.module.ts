import { Module } from "@nestjs/common";

import { DatabaseModule } from "../../shared/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../product/product.module";
import { UserModule } from "../user/user.module";
import { VendigMachineController } from "./controller/vending-machine-controller";

@Module({
    imports: [DatabaseModule, ProductModule, UserModule, AuthModule],
    controllers: [VendigMachineController]
})
export class VendingMachineModule {}
