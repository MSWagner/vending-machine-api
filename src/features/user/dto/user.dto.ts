import { IsEnum, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../../../entities/User.entity";

export class UserDto {
    @IsString()
    @MinLength(3)
    @ApiProperty({ minLength: 3 })
    readonly username: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ minLength: 6 })
    readonly password: string;

    @IsString()
    @MinLength(3)
    @IsEnum(Role)
    @ApiProperty({ minLength: 6 })
    readonly role: Role;
}
