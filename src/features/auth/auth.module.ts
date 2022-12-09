import { Module } from "@nestjs/common";

import { AuthService } from "./services/auth.service";

import { LocalStrategy } from "./strategies/local.strategy";
import { BearerStrategy } from "./strategies/bearer.strategy";

import { UserModule } from "../user/user.module";

import { PassportModule } from "@nestjs/passport";

import { accessTokenProviders } from "./providers/accessTokenProviders";
import { refreshTokenProviders } from "./providers/refreshTokenProviders";
import { LoginController } from "./controller/login/login.controller";
import { RefreshTokenController } from "./controller/refresh-token/refresh-token.controller";

@Module({
    imports: [UserModule, PassportModule],
    providers: [AuthService, LocalStrategy, BearerStrategy, ...accessTokenProviders, ...refreshTokenProviders],
    controllers: [LoginController, RefreshTokenController],
    exports: [AuthService]
})
export class AuthModule {}
