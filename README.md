![Testing](https://github.com/MSWagner/nestjs-starter/workflows/Testing/badge.svg)

# vending-machine-api

Allow users to register as Buyer or Seller. A Buyer can deposit coins and buy products with it, or reset the deposit to get the coins back. The seller can add or update products.

## Start

## Create or edit your local .env file

Set up the environment variable [COMPOSE_FILE](https://docs.docker.com/compose/reference/envvars/#compose_file) to avoid the 'Found orphan containers' warning:

MacOS:

```
COMPOSE_FILE=docker-compose.prod.yml:docker-compose.dev.yml:docker-compose.test.yml
```

Windows:

```
COMPOSE_FILE=docker-compose.prod.yml;docker-compose.dev.yml;docker-compose.test.yml
```

## Installation

```bash
$ yarn
$ yarn build
```

# Development

## Starting the dev enviornment (Docker Container)

```bash
# create docker network for database connection
$ docker network create vending-machine-api-network-dev

# start the app and database in docker containers
$ docker-compose -f 'docker-compose.dev.yml' up

# start first migration to create the db tables
$ yarn db:migrate:dev
```

## Testing Local (without app docker container)

```bash
# start test database in docker container
$ docker-compose -f 'docker-compose.test.yml' up

# start first migration to create the db tables
$ yarn db:migrate:test

# unit tests
$ yarn test

# watch mode
$ yarn test:watch

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Testing in Docker Container

```bash
# start docker containers (app, dev + test)
$ yarn docker:up:hidden

# start first migration to create the db tables
$ yarn docker:db:migrate

# execute tests in the docker container
$ yarn docker:test
```

# Deployment

## First Start

-   To create a docker image + container with the app & database.
-   You have to provide the env variables for the docker-compose.prod file (I set the env variables with Github Secrets in the Github Action).

```bash
# create network to connect the app with the db
$ docker network create vending-machine-api-network

# build the docker image, create & run the app/db container in detached mode (background) 
$ docker-compose -f 'docker-compose.prod.yml' up -d

# init tables with migration
$ docker-compose exec app yarn db:migrate:prod
```

## Docker App Update

-   To update the docker image and start the new docker container

```bash
$ docker build -t vending-machine-api .
$ docker-compose up -d
```

## Docker Migration

-   To run new migrations

```bash
# start migrations
$ docker-compose exec app yarn db:migrate:prod
```

## License

[MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
