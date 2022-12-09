import {
    BaseEntity,
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";

import { RefreshToken } from "./RefreshToken.entity";
import { AccessToken } from "./AccessToken.entity";

export enum Role {
    Buyer = "buyer",
    Seller = "seller"
}

export interface IPublicUserData {
    username: string;
    deposit?: number;
    role: Role;
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column({ type: "text", unique: true, nullable: false })
    username: string;

    @Column({ type: "text", nullable: true, default: null })
    passwordHash: string;

    @Column({ type: "boolean", default: false })
    isActive: boolean;

    @Column({ type: "int", nullable: false, default: 0 })
    deposit: number;

    @Column({ type: "text", nullable: false })
    role: Role;

    @OneToMany((_type) => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];

    @OneToMany((_type) => AccessToken, (accessToken) => accessToken.user)
    accessToken: AccessToken[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    get publicData(): IPublicUserData {
        return {
            username: this.username,
            ...(this.role === Role.Buyer ? { deposit: this.deposit } : {}),
            role: this.role
        };
    }
}
