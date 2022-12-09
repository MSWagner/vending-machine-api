import { Module } from "@nestjs/common";
import { UserController } from "./controller/user.controller";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "./user.module";

@Module({
    imports: [AuthModule, UserModule],
    controllers: [UserController]
})
export class UserApiModule {}
