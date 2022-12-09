import {
    Controller,
    Body,
    Post,
    HttpException,
    HttpStatus,
    Get,
    UseGuards,
    Request,
    Delete,
    Put
} from "@nestjs/common";
import { ApiTags, ApiCreatedResponse } from "@nestjs/swagger";

import { AuthService } from "../../auth/services/auth.service";
import { UserService } from "../services/user.service";

import { CONFIG } from "../../../config";

import { SuccessResponse, UserDto, UserGetResponse, UserPostResponse } from "./_types";
import { Roles } from "../../../features/auth/roles/role.decorator";
import { IPublicUserData, Role, User } from "../../../entities/User.entity";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "../../../features/auth/roles/role.guard";

@ApiTags("user")
@Controller({ path: "user", version: "1" })
export class UserController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @Post()
    @ApiCreatedResponse({ description: "The user has been successfully created.", type: UserPostResponse })
    async createUser(@Body() requestDto: UserDto): Promise<UserPostResponse> {
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

    @Put()
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Buyer, Role.Seller)
    @ApiCreatedResponse({ description: "The user has been successfully updated.", type: UserGetResponse })
    async updateUser(@Request() req, @Body() requestDto: UserDto): Promise<IPublicUserData> {
        try {
            const user = await this.userService.updateUser(req.user, requestDto);

            return user.publicData;
        } catch (err) {
            throw new HttpException("User with the given username already exists", HttpStatus.CONFLICT);
        }
    }

    @Get()
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Buyer, Role.Seller)
    @ApiCreatedResponse({ type: UserGetResponse })
    async getUser(@Request() req): Promise<IPublicUserData> {
        const user: User = req.user;

        return user.publicData;
    }

    @Delete()
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Buyer, Role.Seller)
    @ApiCreatedResponse({ description: "The user has been successfully deleted.", type: SuccessResponse })
    async deleteUser(@Request() req): Promise<SuccessResponse> {
        const user: User = req.user;

        await this.userService.deleteUser(user);
        return { success: true };
    }
}
