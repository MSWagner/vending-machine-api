import * as _ from "lodash";
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLE_KEY } from "./role.decorator";
import { Role } from "../../../entities/User.entity";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();

        if (_.isNil(user)) {
            throw new UnauthorizedException();
        }

        return requiredRoles.some((role) => user.role === role);
    }
}
