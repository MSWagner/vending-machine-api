import { Strategy } from "passport-http-bearer";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

import { User } from "../../../entities/User.entity";
import { AuthService } from "../services/auth.service";

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super();
    }

    async validate(token: string): Promise<User> {
        return this.authService.validateToken(token);
    }
}
