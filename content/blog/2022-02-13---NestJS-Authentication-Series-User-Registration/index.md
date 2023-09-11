---
title: "NestJS Authentication Series 🔐: Part 1 - User registration"
date: "2022-02-13T22:40:32.169Z"
template: "post"
draft: false
slug: "/blog/nestjs-authentication-series/user-registration"
category: "Software Engineering"
tags:
  - "TypeScript"
  - "NodeJS"
  - "NestJS"
description: "Welcome you to my blog series on user authentication in the NestJS framework. This series is a set of several tutorials that extend the official documentation. If you are programming an enterprise application, you will most likely want to include full user support, i.e. email account confirmation, password reminder capability, etc. This post is the first part in a series and below you can find a list of all the other articles on this topic."
socialImage: "/media/thumbnail.jpeg"
---

![Thumbnail](/media/thumbnail.jpeg)

Welcome you to my blog series on user authentication in the NestJS framework. This series is a set of several tutorials that extend the official documentation.

If you are programming an enterprise application, you will most likely want to include full user support, i.e. email account confirmation, password reminder capability, etc.

This post is the first part in a series and below you can find a list of all the other articles on this topic.

- [Part 1: User registration](/blog/nestjs-authentication-series/user-registration)
- Part 2: Confirmation of user registration by email
- Part 3: User authentication using JWT and cookies
- Part 4: Implementation refresh JWT in cookies
- Part 5: User logout
- Part 6: Forgot / Reset password

> **Note**: We'll be getting started programming on the Nest.js prepared official typescript starter, which you can find at [this link](https://github.com/nestjs/typescript-starter). Also remember that all the source code from this article is available on my [GitHub profile](https://github.com/pietrzakadrian).

---

# Technology stack

The application uses the following technology stack:

- **Node.js** & **NestJS** as the server runtime platform,
- **PostgreSQL** relational database,
- Standard **REST API** protocol,
- One of the most popular ORMs: **TypeORM**.

---

# Software architecture

We will use my own software architecture, because in my opinion it is better than the one presented in the official framework template.

```
.
├── node_modules
├── src
│   ├── app
│   │   ├── constants
│   │   │   ├── app.constant.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── authentication
│   │   ├── controllers
│   │   │   ├── authentication.controller.ts
│   │   │   └── index.ts
│   │   ├── dtos
│   │   │   ├── authentication.dto.ts
│   │   │   ├── create-authentication.dto.ts
│   │   │   ├── index.ts
│   │   │   └── registration.dto.ts
│   │   ├── entities
│   │   │   ├── authentication.entity.ts
│   │   │   └── index.ts
│   │   ├── exceptions
│   │   │   ├── index.ts
│   │   │   └── user-already-exist.exception.ts
│   │   ├── providers
│   │   │   ├── authentication.provider.ts
│   │   │   └── index.ts
│   │   ├── repositories
│   │   │   ├── authentication.repository.ts
│   │   │   └── index.ts
│   │   ├── services
│   │   │   ├── authentication.service.ts
│   │   │   └── index.ts
│   │   ├── subscribers
│   │   │   ├── authentication.subscriber.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── common
│   │   ├── dtos
│   │   │   ├── abstract.dto.ts
│   │   │   └── index.ts
│   │   └── entities
│   │       ├── abstract.entity.ts
│   │       └── index.ts
│   ├── database
│   │   ├── constraints
│   │   │   ├── errors.constraint.ts
│   │   │   └── index.ts
│   │   ├── strategies
│   │   │   ├── index.ts
│   │   │   └── snake-naming.strategy.ts
│   │   └── index.ts
│   ├── user
│   │   ├── dtos
│   │   │   ├── create-user.dto.ts
│   │   │   ├── index.ts
│   │   │   └── user.dto.ts
│   │   ├── entities
│   │   │   ├── index.ts
│   │   │   └── user.entity.ts
│   │   ├── repositories
│   │   │   ├── index.ts
│   │   │   └── user.repository.ts
│   │   ├── services
│   │   │   ├── index.ts
│   │   │   └── user.service.ts
│   │   └── index.ts
│   ├── util
│   │   ├── index.ts
│   │   └── setup-swagger.util.ts
│   └── main.ts
├── .env
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json
└── yarn.lock
```

---

# Software development

## 1. Install required npm dependencies

We will need some external packages that we will use to program the authorization.

> **Note**: I use package manager yarn instead of npm by default, so you can remove your **package-lock.json** file if you chose the typescript starter.

```
yarn add pg @hapi/joi @nestjs/config @nestjs/typeorm typeorm class-transformer class-validator bcrypt
```

```
yarn add @types/bcrypt @types/hapi__joi --dev
```

## 2. Define the environment variables

Your application will use environment variables that will remain completely private and cannot be stored in the repository. We also installed the hapi library, which will always check that the data is in the correct format before compiling the code.

We also installed the **@hapi/joi** library, which will always check that the data is in the correct format before compiling the code.

### 2.1. Create an .env file

Create an **.env** file in the root directory:

```
# Application Settings
PORT=9000
NODE_ENV=development

# Database Settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=pietrzakadrian
POSTGRES_PASSWORD=
POSTGRES_DB=nestjs-authentication-full
```

### 2.2. Define an environment variable

This will keep our code more readable. In the **src/app/constants** directory I create a new file **app.constant.ts**:

```typescript
export enum NODE_ENV {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}
```

### 2.3. Validation of environmental variables

Now we can define a validator in the **index.ts** file of the **app** module. The implementation looks like this:

```typescript
import * as Joi from "@hapi/joi";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NODE_ENV } from "./constants";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        NODE_ENV: Joi.string()
          .required()
          .valid(NODE_ENV.DEVELOPMENT, NODE_ENV.PRODUCTION),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required().allow(""),
        POSTGRES_DB: Joi.string().required(),
      }),
    }),
  ],
})
export class AppModule {}
```

> **Note**: My database password is an empty string, therefore I allow it to be left empty.

We can also use them elsewhere in the application, i.e. in the **main.ts** file:

```typescript
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = +configService.get<number>("PORT");

  await app.listen(PORT);
}

void bootstrap();
```

Environment variables have been implemented. Brilliant! 👊

## 3. Create database module

It's time to program the database module. This module, as the name suggests, is responsible for communicating with postgres.

We will include the snake_naming strategy and add a constraint for the unique value.

### 3.1. Error code for unique values

In the **src/database/constraints** directory, create the **errors.constraint.ts** file:

```typescript
export enum PostgresErrorCode {
  UniqueViolation = "23505",
}
```

This is needed to catch an error in the controller if the specified email address repeats.

### 3.2. Snake Naming Strategy

Defined in the typescript model, a field such as **firstName** will be stored as **first_name** in the db. This will improve code readability and keep it in **titleCase** format.

Create **snake-naming.strategy.ts** in **src/database/strategies**:

```typescript
import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils";

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName ? customName : snakeCase(className);
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[]
  ): string {
    return (
      snakeCase(embeddedPrefixes.join("_")) +
      (customName ? customName : snakeCase(propertyName))
    );
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(relationName + "_" + referencedColumnName);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
    _secondPropertyName: string
  ): string {
    return snakeCase(
      firstTableName +
        "_" +
        firstPropertyName.replace(/\./gi, "_") +
        "_" +
        secondTableName
    );
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string
  ): string {
    return snakeCase(
      tableName + "_" + (columnName ? columnName : propertyName)
    );
  }

  classTableInheritanceParentColumnName(
    parentTableName: string,
    parentTableIdPropertyName: string
  ): string {
    return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`);
  }
}
```

### 3.3. TypeORM configuration

Finally, create a base class by importing the required dependencies:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NODE_ENV } from "src/app/constants";
import { SnakeNamingStrategy } from "./strategies";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_HOST"),
        port: configService.get("POSTGRES_PORT"),
        username: configService.get("POSTGRES_USER"),
        password: configService.get("POSTGRES_PASSWORD"),
        database: configService.get("POSTGRES_DB"),
        entities: [__dirname + "/../**/*.entity{.ts,.js}"],
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: configService.get("NODE_ENV") === NODE_ENV.DEVELOPMENT,
        logging: configService.get("NODE_ENV") === NODE_ENV.DEVELOPMENT,
        extra: { charset: "utf8mb4_unicode_ci" },
      }),
    }),
  ],
})
export class DatabaseModule {}
```

> **Note**: Define charset utf8mb4 if you want to be able to store emoji in database.

To make your code complicated, import this module to the main application module.

```diff
+ import { DatabaseModule } from 'src/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      ...
    }),
+   DatabaseModule,
  ],
})
export class AppModule {}
```

That's right, now the database is used in our application. Getting closer to completion! 💨

## 4. Common files

Our data models will contain common parts such as **id** column, **uuid**, **created_at** etc. This is an ideal opportunity to create an abstract class from which the other models will inherit.

### 4.1. Create an abstract entity

Create a new file in the **src/common/entities** directory called **abstract.entity.ts**.

```typescript
import { Exclude } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  public id: number;

  @Column()
  @Generated("uuid")
  public uuid: string;

  @CreateDateColumn()
  @Exclude()
  public createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  public updatedAt: Date;
}
```

We use the **@Exclude()** decorator to not return sensitive data in the controllers response. For this to work, we need to make some changes to the **main.ts** application file:

```diff
+ import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  const PORT = +configService.get<number>('PORT');

+ app.useGlobalPipes(new ValidationPipe({ transform: true }));
+ app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  await app.listen(PORT);
}

void bootstrap();
```

Now everything is ok. Validation will be tested at the end of this article.

## 5. Create user module

We will be registering a new user, so it would be a good idea to create a module responsible for processing user data. Sensitive data such as email, password, tokens will be stored in another entity and will be bound by a one to one relationship.

> **Note**: This will keep the database more organized, but when creating a new user we will have to use a transaction.

### 5.1 Create a model

First, define the data model. As I mentioned earlier, authorization information such as email or password will be stored in another table. Therefore, we will make a one to one relationship.

So in the **src/users/entities** directory we create a file called **user.entity.ts**:

```typescript
import { AuthenticationEntity } from "src/authentication/entities";
import { AbstractEntity } from "src/common/entities";
import { Column, Entity, JoinColumn, OneToOne, Index } from "typeorm";

@Entity({ name: "users" })
export class UserEntity extends AbstractEntity {
  @Column()
  public firstName: string;

  @OneToOne(
    () => AuthenticationEntity,
    (authentication: AuthenticationEntity) => authentication.user,
    { eager: true, nullable: false, onDelete: "CASCADE" }
  )
  @JoinColumn()
  @Index()
  public authentication: AuthenticationEntity;
}
```

> ❗️ **Note**: At this point, **Authentication Entity** is not yet defined. We'll do that in a moment when we get to the authentication section.

This is also what a repository is made for, so let's make it similar to what we just did. In the **repositories** directory, let's create the file **user.repository.ts**:

```typescript
import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { UserEntity } from "../entities";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {}
```

Let's also prepare a **D**ata **T**ransform **O**bject class that will contain validations. You can put these decorators simply in the user.entity.ts file, but it won't be stylish. It is better to make **user.dto.ts** file in **src/user/dtos** directory.

```typescript
import { IsNotEmpty, IsString } from "class-validator";
import { CreateAuthenticationDto } from "src/authentication/dtos";

export class CreateUserDto extends CreateAuthenticationDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;
}
```

> **Note**: **CreateAuthenticationDto** is also not defined yet, but we'll do that in a moment.

From this point on, when creating a new entity, firstName will be required and without it, the code will not execute.

### 5.2 Create a service

Services are responsible for executing the logic. The controller uses service dependencies.\
As I mentioned earlier, we will be using transactions, so let's already prepare a function that provides all the required parameters.

Create a file **user.service.ts** in the **src/user/services** directory:

```typescript
import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "src/user/dtos";
import { AuthenticationEntity } from "src/authentication/entities";
import { QueryRunner } from "typeorm";
import { UserEntity } from "../entities";
import { UserRepository } from "../repositories";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  async createUser(
    createUserDto: CreateUserDto,
    authentication: AuthenticationEntity,
    queryRunner: QueryRunner
  ): Promise<UserEntity> {
    const user = this._userRepository.create({
      ...createUserDto,
      authentication,
    });

    return queryRunner.manager.save(user);
  }
}
```

Now we can put all the dependencies together. In the main module class, instantiate the services:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "./repositories";
import { UserService } from "./services";

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

Also, don't forget to add a module to the base class:

```diff
+ import { UserModule } from 'src/user';

@Module({
  imports: [
    ConfigModule.forRoot({
      ...
    }),
    DatabaseModule,
+   UserModule,
  ],
})
export class AppModule {}
```

Now the user module has been programmed in its entirety. ✅

## 6. Create authentication module

Let's talk about the authentication module. In this directory, you will store all the logic associated with it.

### 6.1. Authentication model

As I wrote earlier, there will be a data model here that will store sensitive information such as email address or password.

Create the **authentication.entity.ts** file in the **src/authentication/entities** directory:

```typescript
import { Exclude } from "class-transformer";
import { AbstractEntity } from "src/common/entities";
import { UserEntity } from "src/user/entities";
import { Column, Entity, OneToOne } from "typeorm";

@Entity({ name: "authentications" })
export class AuthenticationEntity extends AbstractEntity {
  @Column({ unique: true })
  public emailAddress: string;

  @Column()
  @Exclude()
  public password: string;

  @OneToOne(() => UserEntity, (user: UserEntity) => user.authentication)
  @Exclude()
  public user: UserEntity;
}
```

> **Note**: You can now bind these 2 entities with a one to one relationship.

For the model, you traditionally create a repository:

```typescript
import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AuthenticationEntity } from "../entities";

@EntityRepository(AuthenticationEntity)
export class AuthenticationRepository extends Repository<AuthenticationEntity> {}
```

And let's finally create the missing dto class:

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateAuthenticationDto {
  @IsEmail()
  @IsNotEmpty()
  readonly emailAddress: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
```

### 6.2. Authentication provider

You need a class that is responsible for performing the hash service.\
A good practice is to create **authentication.provider.ts** in the **src/authentication/providers** directory:

```typescript
import * as bcrypt from "bcrypt";

export class AuthenticationProvider {
  static async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
```

### 6.3. Subscriber

Let's deal with the subscriber now. You should already know that sensitive data such as a password should not be a simple string of characters. If the data is leaked from the database, all your accounts will be stolen.

TypeORM has the ability to perform the operation before the insertion, and this is an ideal place to convert a password from a string to a hash.

Create **authentication.subscriber.ts** in the directory **src/authentication/subscribers**:

```typescript
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { AuthenticationEntity } from "../entities";
import { AuthenticationProvider } from "../providers";

@EventSubscriber()
export class AuthenticationSubscriber
  implements EntitySubscriberInterface<AuthenticationEntity>
{
  listenTo() {
    return AuthenticationEntity;
  }

  async beforeInsert({
    entity,
  }: InsertEvent<AuthenticationEntity>): Promise<void> {
    if (entity.password) {
      entity.password = await AuthenticationProvider.generateHash(
        entity.password
      );
    }

    if (entity.emailAddress) {
      entity.emailAddress = entity.emailAddress.toLowerCase();
    }
  }

  async beforeUpdate({
    entity,
    databaseEntity,
  }: UpdateEvent<AuthenticationEntity>): Promise<void> {
    if (entity.password) {
      const password = await AuthenticationProvider.generateHash(
        entity.password
      );

      if (password !== databaseEntity?.password) {
        entity.password = password;
      }
    }
  }
}
```

> **Note**: This is a good opportunity to save your email address in lower case format.

Remember to run the subscriber in the **subscribers array** in the **database** module:

```diff
+ import { AuthenticationSubscriber } from 'src/authentication/subscribers';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...
+       subscribers: [AuthenticationSubscriber],
      }),
    }),
  ],
})
export class DatabaseModule {}
```

### 6.4. Service

Here we will write the logic that the controller will execute.\
As I mentioned, we will be using transactions because we are inserting data in two tables (users and authentications).

Now look at the code you put in the **authentication.service.ts** file:

```typescript
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PostgresErrorCode } from "src/database/constraints";
import { UserEntity } from "src/user/entities";
import { UserService } from "src/user/services";
import { Connection, QueryRunner } from "typeorm";
import { CreateAuthenticationDto } from "../dtos";
import { RegistrationDto } from "../dtos/registration.dto";
import { AuthenticationEntity } from "../entities";
import { UserAlreadyExistException } from "../exceptions";
import { AuthenticationRepository } from "../repositories";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly _authenticationRepository: AuthenticationRepository,
    private readonly _userService: UserService,
    private readonly _connection: Connection
  ) {}

  async registration(registrationDto: RegistrationDto): Promise<UserEntity> {
    let user: UserEntity;
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const authentication = await this._createAuthentication(
        registrationDto,
        queryRunner
      );

      user = await this._userService.createUser(
        registrationDto,
        authentication,
        queryRunner
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new UserAlreadyExistException();
      }

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    return user;
  }

  private async _createAuthentication(
    createAuthenticationDto: CreateAuthenticationDto,
    queryRunner: QueryRunner
  ): Promise<AuthenticationEntity> {
    const authentication = this._authenticationRepository.create(
      createAuthenticationDto
    );

    return queryRunner.manager.save(authentication);
  }
}
```

Remember that the email address must be unique. It is good to be able to catch this error, so we create **user-already-exist.exception.ts** in the **exceptions** directory:

```typescript
import { BadRequestException } from "@nestjs/common";

export class UserAlreadyExistException extends BadRequestException {
  constructor(error?: string) {
    super("User with that email already exists", error);
  }
}
```

Additionally, we use **RegistrationDto** make the code look more stylish. This is basically the same as CreateUserDto, but named differently:

```typescript
import { CreateUserDto } from "src/user/dtos";

export class RegistrationDto extends CreateUserDto {}
```

The service is ready, it can now be exposed to the controller for use. ✅

### 6.5. Controller

The registration logic is located at **/Authentication/registration**.

> **Note**: Ideally, it should be hosted at **/Users** with the POST method. But this is hard to do, because then it will make circular dependency. User module will use authentication dependency and vice versa. It can be solved [this way](https://docs.nestjs.com/fundamentals/circular-dependency), but it is an antipattern. It's not worth doing.

Create an **authentication.controller.ts** file in the **controlers** directory:

```typescript
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { UserEntity } from "src/user/entities";
import { RegistrationDto } from "../dtos";
import { AuthenticationService } from "../services";

@Controller("Authentication")
export class AuthenticationController {
  constructor(private readonly _authenticationService: AuthenticationService) {}

  @Post("registration")
  @HttpCode(HttpStatus.OK)
  async registration(
    @Body() registrationDto: RegistrationDto
  ): Promise<UserEntity> {
    return this._authenticationService.registration(registrationDto);
  }
}
```

### 6.6. Inject all dependencies to module

Now everything is merged into a single whole using the module.

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user";
import { AuthenticationController } from "./controllers";
import { AuthenticationRepository } from "./repositories";
import { AuthenticationService } from "./services";

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([AuthenticationRepository])],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
```

You must declare this module in the main application module as well:

```diff
+ import { AuthenticationModule } from 'src/authentication';

@Module({
  imports: [
    ConfigModule.forRoot({
      ...
    }),
    DatabaseModule,
+   AuthenticationModule,
    UserModule,
  ],
})
export class AppModule {}
```

Yes sir, everything is ready. Good job how you made it here. 👍 Let's see if this masterpiece even works. 😆

## 7. Tests

It is now time to test our application. Let's send a **POST** request to the controller with the address **/Authentication/registration** with the body attached:

```json
{
  "firstName": "Adrian",
  "emailAddress": "contact@pietrzakadrian.com",
  "password": "123456"
}
```

The controller will perform the following SQL operation:

```sql
START TRANSACTION
INSERT INTO "authentications"("uuid", "created_at", "updated_at", "email_address", "password") VALUES (DEFAULT, DEFAULT, DEFAULT, $1, $2) RETURNING "id", "uuid", "created_at", "updated_at" -- PARAMETERS: ["contact@pietrzakadrian.com","$2b$10$x0oV4oPS7ehhCSp537ygruWKxKpSX4MXlluqvxzSibRFCh2kMSS7i"]
INSERT INTO "users"("uuid", "created_at", "updated_at", "first_name", "authentication_id") VALUES (DEFAULT, DEFAULT, DEFAULT, $1, $2) RETURNING "id", "uuid", "created_at", "updated_at" -- PARAMETERS: ["Adrian",1]
COMMIT
```

> **Note**: You can see that the password has been encoded by the subscriber before insert record to database.

And in response, we get the created object, without sensitive data such as id or password:

```json
{
  "uuid": "0cc8f6cd-44f4-4d73-9bef-9f3b872180c4",
  "firstName": "Adrian",
  "authentication": {
    "uuid": "b3c257e6-85b4-49b8-b0a0-877e3c936a4e",
    "emailAddress": "contact@pietrzakadrian.com"
  }
}
```

Let's still check that the validation is working. I will now send a request without a firstName:

```json
{
  "statusCode": 400,
  "message": ["firstName should not be empty", "firstName must be a string"],
  "error": "Bad Request"
}
```

I will still try to add the same email address:

```json
{
  "statusCode": 400,
  "message": "User with that email already exists",
  "error": "Bad Request"
}
```

Perfect! The effect that was wanted was obtained. 🎉

## 8. Bonus: OpenAPI documentation

Technical documentation is necessary when producing professional software. It is also very useful for a developer. The NestJS framework provides a tool that makes it very easy to generate OpenAPI documentation. We will now add this to the project, this will allow us to keep the source code transparent later.

### 8.1. Add required dependencies

Install the required dependencies into your project:

```
yarn add @nestjs/swagger swagger-ui-express
```

### 8.2. Create a Setup Swagger function

Create **setup-swagger.util.ts** file in the **utils** directory:

```typescript
import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle("NestJS-Authentication-Full")
    .setContact(
      "Adrian Pietrzak",
      "https://pietrzakadrian.com",
      "contact@pietrzakadrian.com"
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("documentation", app, document);
}
```

Now you can compile the documentation along with the application.

```diff
+ import { setupSwagger } from './util';

async function bootstrap() {
  ...
+ if (configService.get<string>('NODE_ENV') === NODE_ENV.DEVELOPMENT) {
+   setupSwagger(app);
+ }

  await app.listen(PORT);
}

void bootstrap();
```

> **Note**: Remember to make it available only in development mode.

### 8.3. Decorate classes

Now you need to add some decorators to your dto and controller classes.
Keep track now of the changes I make to the files:

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class AbstractDto {
  @ApiProperty({ format: "uuid" })
  readonly uuid: string;
}
```

```diff
+ import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends CreateAuthenticationDto {
  @IsString()
  @IsNotEmpty()
+ @ApiProperty()
  readonly firstName: string;
}
```

```diff
+ import { ApiProperty } from '@nestjs/swagger';

- export class UserDto {
+ export class UserDto extends AbstractDto {
+ @ApiProperty()
  readonly firstName: string;

+ @ApiProperty({ type: () => AuthenticationDto })
  readonly authentication: AuthenticationDto;
}
```

```diff
+ import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthenticationDto {
  @IsEmail()
  @IsNotEmpty()
+ @ApiProperty()
  readonly emailAddress: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
+ @ApiProperty()
  readonly password: string;
}
```

```diff
import { ApiProperty } from '@nestjs/swagger';
import { AbstractDto } from 'src/common/dtos';

- export class AuthenticationDto {
+ export class AuthenticationDto extends AbstractDto {
+ @ApiProperty()
  readonly emailAddress: string;
}
```

```diff
+ import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
+ import { UserDto } from 'src/user/dtos';

@Controller('Authentication')
+ @ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly _authenticationService: AuthenticationService) {}

  @Post('registration')
  @HttpCode(HttpStatus.OK)
+ @ApiOkResponse({ type: UserDto, description: 'Successfully created user' })
+ @ApiBadRequestResponse({ description: 'User with that email already exists.' })
+ @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async registration(
    @Body() registrationDto: RegistrationDto,
  ): Promise<UserEntity> {
    return this._authenticationService.registration(registrationDto);
  }
}
```

### 8.4. Preview

When you go to **/documentation**, you will get a properly generated Swagger document:

![Swagger](/media/swagger.png)

A very quick change and simplifies the process of documenting software application. 📄

---

# Summary

This article presents a complete implementation of new user registration based on advanced programming techniques of TypeScript language and NestJS framework. Environment variables were defined and validated. The subscriber operation in TypeORM was explained and transactions in postgres was applied.

---

You can also find this article on [medium.com](https://medium.com/@pietrzakadrian) where I share my solutions to the problems I encountered during my software engineer career.

If you have additional questions, you can write to me on [LinkedIn](https://www.linkedin.com/in/pietrzakadrian/) or [Twitter](https://twitter.com/pietrzakadrian/).
