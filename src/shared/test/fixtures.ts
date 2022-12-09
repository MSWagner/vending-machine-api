export const user1 = {
    uid: "0961866f-ff60-4219-973c-109eecfa52bd",
    username: "user1@email.at",
    isActive: true,
    role: "buyer",
    passwordHash: "$2b$10$n8McQmLm6U/RXlRb9HxNEOgurQecAokxI2oCoumlSOlOj4M.aU59K" // testPassword
};

export const user2 = {
    uid: "515c96fd-7535-4e74-92ff-2bfbe960c6e6",
    username: "user2@email.at",
    isActive: true,
    role: "buyer",
    passwordHash: "$2b$10$n8McQmLm6U/RXlRb9HxNEOgurQecAokxI2oCoumlSOlOj4M.aU59K" // testPassword,
};

export const user3 = {
    uid: "435c0a53-9e6b-488a-9d1c-582b108ed3e7",
    isActive: true,
    username: "user3@email.com",
    role: "seller"
};

export const userInActive = {
    uid: "17f0263a-87b1-4760-90c1-2e596a514678",
    username: "userInActive@email.com",
    role: "buyer",
    passwordHash: "$2b$10$n8McQmLm6U/RXlRb9HxNEOgurQecAokxI2oCoumlSOlOj4M.aU59K" // testPassword
};

export const accessToken1 = {
    token: "4f593a80-0ecb-49c3-9685-4d59be8239aa",
    validUntil: "2050-08-07 23:45:22.501",
    user: user1.uid
};

export const accessTokenUser2 = {
    token: "190c51c5-5930-42e8-86cf-3794977f1e9b",
    validUntil: "2050-08-07 23:45:22.501",
    user: user2.uid
};

export const accessTokenUser3Seller = {
    token: "0fa3f2c4-04e4-4d9e-b983-b2475b799d18",
    validUntil: "2050-08-07 23:45:22.501",
    user: user3.uid
};

export const invalidAccessToken = {
    token: "b0d5c63f-b69b-4f5f-b737-627aadf38615",
    validUntil: "2010-08-07 23:45:22.501",
    user: user2.uid
};

export const refreshToken1 = {
    token: "5306fa4e-880b-4a9f-8e5e-7d62775342b6",
    user: user1.uid
};

export const invalidRefreshToken = {
    token: "8781b807-6036-4af2-8db4-1f3f7b33f9e3",
    validUntil: "2010-08-07 23:45:22.501",
    user: user2.uid
};

export const product1User3Seller = {
    uid: "a3b85b96-eae9-43ed-b152-71a33b7520ff",
    productName: "product1",
    cost: 100,
    amountAvailable: 10,
    seller: user3.uid
};

export const product2User3Seller = {
    uid: "ec8fa915-361d-44de-be9f-b79c6f6e696c",
    productName: "product2",
    cost: 10,
    amountAvailable: 1,
    seller: user3.uid
};

export const fixtureTrees = {
    User: [user1, user2, user3, userInActive],
    RefreshToken: [refreshToken1, invalidRefreshToken],
    AccessToken: [accessToken1, accessTokenUser2, accessTokenUser3Seller, invalidAccessToken],
    Product: [product1User3Seller, product2User3Seller]
};
