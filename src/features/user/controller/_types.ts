import { ApiProperty } from "@nestjs/swagger";

export class UserPostResponse {
    @ApiProperty()
    readonly tokenType: string;

    @ApiProperty()
    readonly expiresIn: number;

    @ApiProperty({ format: "uuid" })
    refreshToken: string;

    @ApiProperty({ format: "uuid" })
    accessToken: string;
}

export class UserGetResponse {
    @ApiProperty()
    readonly username: string;

    @ApiProperty()
    readonly role: string;

    @ApiProperty()
    readonly deposit?: number;
}

export class SuccessResponse {
    @ApiProperty()
    readonly success: boolean;
}
