import { IsDivisibleBy, IsInt, IsString, Min, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProductUpsertDto {
    @IsString()
    @MinLength(3)
    @ApiProperty({ minLength: 3 })
    readonly productName: string;

    @IsInt()
    @Min(5)
    @IsDivisibleBy(5)
    @ApiProperty({ minimum: 0 })
    readonly cost: number;

    @IsInt()
    @Min(0)
    @ApiProperty({ minimum: 0 })
    readonly amountAvailable: number;
}

export class ProductResponseDto extends ProductUpsertDto {
    @ApiProperty({ format: "uuid" })
    readonly uid: string;

    @ApiProperty({ type: "date" })
    readonly createdAt: Date;

    @ApiProperty({ type: "date" })
    readonly updatedAt: Date;
}
