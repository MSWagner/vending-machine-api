import { Controller, Request, Post, Body, UseGuards, HttpException, HttpStatus, HttpCode } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { getConnection } from "typeorm";

import { Roles } from "../../auth/guards/role.decorator";
import { Product, Role } from "../../../entities/Product.entity";
import { RoleGuard } from "../../auth/guards/role.guard";

import { User } from "../../../entities/User.entity";

import { BuyBody, BuyResponse, DepositBody, ResetResponse, SuccessResponse, VALID_COINS } from "./_types";

@ApiTags("vending-machine")
@Controller({ version: "1" })
export class VendigMachineController {
    @Post("deposit")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Buyer)
    @ApiCreatedResponse({ description: "The buyer has successful deposit coins.", type: SuccessResponse })
    async deposit(@Request() req, @Body() depositBody: DepositBody): Promise<SuccessResponse> {
        const queryRunner = await getConnection().createQueryRunner();
        await queryRunner.startTransaction();

        const user = await queryRunner.manager.getRepository(User).findOne(req.user.uid);
        user.deposit += depositBody.coin;

        try {
            await await queryRunner.manager.getRepository(User).save(user);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await queryRunner.release();
        }

        return { success: true };
    }

    @Post("buy")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Buyer)
    @ApiCreatedResponse({ description: "The buyer has successful bought a product.", type: BuyResponse })
    async buy(@Request() req, @Body() buyBody: BuyBody): Promise<BuyResponse> {
        const queryRunner = await getConnection().createQueryRunner();
        await queryRunner.startTransaction();

        let product = await queryRunner.manager.getRepository(Product).findOne(buyBody.productUid);

        if (!product) {
            throw new HttpException("Product not found", HttpStatus.NOT_FOUND);
        }

        if (product.amountAvailable < 1) {
            throw new HttpException("Product is out of stock", HttpStatus.BAD_REQUEST);
        }

        if (product.amountAvailable < buyBody.amount) {
            throw new HttpException("Not enough products available", HttpStatus.BAD_REQUEST);
        }

        let user = await queryRunner.manager.getRepository(User).findOne(req.user.uid);
        const productsPrice = product.cost * buyBody.amount;

        if (user.deposit < productsPrice) {
            throw new HttpException("Insufficient deposit", HttpStatus.BAD_REQUEST);
        }

        let change = 0;

        try {
            change = user.deposit - productsPrice;
            product.amountAvailable -= buyBody.amount;
            user.deposit = 0;

            product = await queryRunner.manager.getRepository(Product).save(product);
            user = await queryRunner.manager.getRepository(User).save(user);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await queryRunner.release();
        }

        let changeCoins: number[] = [];
        if (change > 0) {
            changeCoins = this.getChangeCoins(change, VALID_COINS);
        }

        return {
            product: product.publicData,
            spent: productsPrice,
            change: changeCoins
        };
    }

    @Post("reset")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Buyer)
    @ApiCreatedResponse({ description: "The buyer has successful reset there deposit.", type: ResetResponse })
    async reset(@Request() req): Promise<ResetResponse> {
        const queryRunner = await getConnection().createQueryRunner();
        await queryRunner.startTransaction();

        const user = await queryRunner.manager.getRepository(User).findOne(req.user.uid);
        const changeCoins = this.getChangeCoins(user.deposit, VALID_COINS);
        user.deposit = 0;

        try {
            await await queryRunner.manager.getRepository(User).save(user);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await queryRunner.release();
        }

        return { change: changeCoins };
    }

    getChangeCoins(change: number, validCoins: number[]): number[] {
        const changeCoins: number[] = [];

        validCoins
            .sort((a, b) => b - a)
            .forEach((coin) => {
                while (change >= coin) {
                    changeCoins.push(coin);
                    change -= coin;
                }
            });

        return changeCoins;
    }
}
