import { Controller, Body, Post, HttpException, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiCreatedResponse } from "@nestjs/swagger";

import { AuthService } from "../../auth/services/auth.service";
import { UserService } from "../services/user.service";

import { CONFIG } from "../../../config";

import { UserDto, UserPostResponse } from "./_types";

@ApiTags("user")
@Controller({ path: "user", version: "1" })
export class UserController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @Post()
    @ApiCreatedResponse({ description: "The user has been successfully created.", type: UserPostResponse })
    async handler(@Body() requestDto: UserDto): Promise<UserPostResponse> {
        try {
            const newUser = await this.userService.createUser(
                requestDto.username,
                requestDto.password,
                requestDto.role
            );
            const tokens = await this.authService.generateToken(newUser);

            return {
                tokenType: "Bearer",
                expiresIn: CONFIG.auth.tokenValidity,
                accessToken: tokens.accessToken.token,
                refreshToken: tokens.refreshToken.token
            };
        } catch (err) {
            throw new HttpException("User with the given username already exists", HttpStatus.CONFLICT);
        }
    }
}
