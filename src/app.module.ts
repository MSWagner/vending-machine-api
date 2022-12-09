import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./features/auth/auth.module";
import { UserApiModule } from "./features/user/user-api-module";

import { DatabaseModule } from "./shared/database/database.module";

@Module({
    imports: [DatabaseModule, AuthModule, UserApiModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
