import { Connection, Repository } from "typeorm";
import { Product } from "../../entities/Product.entity";

import CONFIG from "../../config";

export const productProviders = [
    {
        provide: CONFIG.database.defaultProductRepoName,
        useFactory: (connection: Connection): Repository<Product> => connection.getRepository(Product),
        inject: [CONFIG.database.defaultConnectionName]
    }
];
