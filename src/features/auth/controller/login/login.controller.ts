import { Controller, Request, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBody, ApiCreatedResponse, ApiTags } from "@nestjs/swagger";

import { LoginDto, LoginResponse } from "./_types";
import { AuthService } from "../../services/auth.service";

import { CONFIG } from "../../../../config";

import { Roles } from "../../guards/role.decorator";
import { Role } from "../../../../entities/User.entity";
import { RoleGuard } from "../../guards/role.guard";

@ApiTags("auth")
@UseGuards(AuthGuard("local"))
@Controller({ path: "auth/login", version: "1" })
export class LoginController {
    constructor(private readonly authService: AuthService) {}

    @Post()
    @UseGuards(RoleGuard)
    @Roles(Role.Buyer, Role.Seller)
    @ApiBody({ type: LoginDto })
    @ApiCreatedResponse({ description: "The credentials has been successfully created.", type: LoginResponse })
    async handler(@Request() req): Promise<LoginResponse> {
        const tokens = await this.authService.login(req.user);

        return {
            tokenType: "Bearer",
            expiresIn: CONFIG.auth.tokenValidity,
            accessToken: tokens.accessToken.token,
            refreshToken: tokens.refreshToken.token
        };
    }
}
