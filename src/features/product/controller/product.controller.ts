import _ from "lodash";
import {
    Controller,
    Request,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
    Get,
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";

import { Roles } from "../../auth/guards/role.decorator";
import { IPublicProductData, Product, Role } from "../../../entities/Product.entity";
import { ProductService } from "../services/product.service";
import { RoleGuard } from "../../auth/guards/role.guard";
import { ProductUpsertDto, ProductResponseDto } from "../dto/product.dto";
import { SuccessResponse } from "./_types";

@ApiTags("products")
@Controller({ path: "products", version: "1" })
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post()
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Seller)
    @ApiCreatedResponse({ description: "The product has been successfully created.", type: ProductResponseDto })
    async create(@Request() req, @Body() productDto: ProductUpsertDto): Promise<IPublicProductData> {
        return (await this.productService.create(req.user, productDto)).publicData;
    }

    @Put(":uid")
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Seller)
    @ApiCreatedResponse({ description: "The product has been successfully updated.", type: ProductResponseDto })
    async update(
        @Request() req,
        @Param("uid") uid: string,
        @Body() productDto: ProductUpsertDto
    ): Promise<IPublicProductData> {
        const product = await this.productService.findOne(uid);

        this.checkValidProductOwner(product, req.user.uid);

        return (await this.productService.update(product, req.user, productDto)).publicData;
    }

    @Get()
    @ApiCreatedResponse({ type: ProductResponseDto, isArray: true })
    async findAll(): Promise<IPublicProductData[]> {
        return (await this.productService.findAll()).map((product) => product.publicData);
    }

    @Get(":uid")
    @ApiCreatedResponse({ type: ProductResponseDto })
    async findOne(@Param("uid") uid: string): Promise<IPublicProductData> {
        const product = await this.productService.findOne(uid);

        if (_.isNil(product)) {
            throw new HttpException("Product could not be found.", HttpStatus.NOT_FOUND);
        } else {
            return product.publicData;
        }
    }

    @Delete(":uid")
    @UseGuards(AuthGuard("bearer"), RoleGuard)
    @Roles(Role.Seller)
    @ApiCreatedResponse({ description: "The product has been successfully deleted.", type: SuccessResponse })
    async remove(@Request() req, @Param("uid") uid: string): Promise<SuccessResponse> {
        const product = await this.productService.findOne(uid);

        this.checkValidProductOwner(product, req.user.uid);

        await this.productService.delete(product);

        return { success: true };
    }

    private checkValidProductOwner(product: Product, userUid: string): void {
        if (_.isNil(product)) {
            throw new HttpException("Product could not be found.", HttpStatus.NOT_FOUND);
        }

        if (product.seller.uid !== userUid) {
            throw new HttpException("You are not the owner of this product.", HttpStatus.UNAUTHORIZED);
        }
    }
}
