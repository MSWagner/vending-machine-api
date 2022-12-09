import {
    BaseEntity,
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne
} from "typeorm";

import { User } from "./User.entity";

export enum Role {
    Buyer = "buyer",
    Seller = "seller"
}

export interface IPublicProductData {
    uid: string;
    productName: string;
    cost: number;
    amountAvailable: number;
}

@Entity()
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column({ type: "text", nullable: false })
    productName: string;

    @Column({ type: "int", nullable: false })
    cost: number;

    @Column({ type: "int", nullable: false, default: 0 })
    amountAvailable: number;

    @ManyToOne((_type) => User, (seller) => seller.products, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false
    })
    seller: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    get publicData(): IPublicProductData {
        return {
            uid: this.uid,
            productName: this.productName,
            cost: this.cost,
            amountAvailable: this.amountAvailable
        };
    }
}
