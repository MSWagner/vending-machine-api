import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { Injectable, Inject } from "@nestjs/common";

import { Role, User } from "../../../entities/User.entity";

import CONFIG from "../../../config";
import { UserDto } from "../controller/_types";

@Injectable()
export class UserService {
    private saltRounds = 10;

    constructor(
        @Inject(CONFIG.database.defaultUserRepoName)
        private readonly userRepository: Repository<User>
    ) {}

    private async getHash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async findOneUser(username: string): Promise<User | undefined> {
        return this.userRepository.findOne({ username });
    }

    async createUser(username: string, password: string, role: Role): Promise<User> {
        const user = new User();

        user.username = username;
        user.role = role;
        user.passwordHash = await this.getHash(password);

        return this.userRepository.save(user);
    }

    async updateUser(user: User, updateDto: UserDto): Promise<User> {
        user.username = updateDto.username;
        user.role = updateDto.role;
        user.passwordHash = await this.getHash(updateDto.password);

        return this.userRepository.save(user);
    }

    async deleteUser(user: User): Promise<User> {
        return this.userRepository.remove(user);
    }
}
