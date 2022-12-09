import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { userProviders } from "./user.providers";

import { DatabaseModule } from "../../shared/database/database.module";

@Module({
    imports: [DatabaseModule],
    providers: [...userProviders, UserService],
    exports: [DatabaseModule, UserService, ...userProviders]
})
export class UserModule {}
