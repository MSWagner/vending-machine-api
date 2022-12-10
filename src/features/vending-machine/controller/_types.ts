import { IsEnum, IsInt, IsUUID, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IPublicProductData } from "src/entities/Product.entity";

export enum ValidCoins {
    Five = 5,
    Ten = 10,
    Twenty = 20,
    Fifty = 50,
    Hundred = 100
}

export const VALID_COINS: number[] = [
    ValidCoins.Hundred,
    ValidCoins.Fifty,
    ValidCoins.Twenty,
    ValidCoins.Ten,
    ValidCoins.Five
];

export class DepositBody {
    @IsInt()
    @IsEnum(ValidCoins)
    @ApiProperty({ type: "int", enum: ValidCoins })
    readonly coin: number;
}

export class BuyBody {
    @IsUUID()
    @ApiProperty({ type: "uuid" })
    readonly productUid: string;

    @IsInt()
    @Min(1)
    @ApiProperty({ type: "int" })
    readonly amount: number;
}

export class BuyResponse {
    @ApiProperty({ type: "product" })
    readonly product: IPublicProductData;

    @ApiProperty({ type: "int" })
    readonly spent: number;

    @ApiProperty({ type: "int", isArray: true })
    readonly change: number[];
}

export class ResetResponse {
    @ApiProperty({ type: "int", isArray: true })
    readonly change: number[];
}

export class SuccessResponse {
    @ApiProperty({ type: "boolean" })
    readonly success: boolean;
}
