import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { Role } from "../../../entities/User.entity";

export const ROLE_KEY = "roles";
export const Roles = (...roles: Role[]): CustomDecorator<string> => SetMetadata(ROLE_KEY, roles);
