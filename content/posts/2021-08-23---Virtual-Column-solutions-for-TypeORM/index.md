---
title: Virtual Column solutions for TypeORM
date: "2021-08-23T22:40:32.169Z"
template: "post"
draft: false
slug: "/blog/virtual-column-solutions-for-typeorm"
category: "Software Engineering"
tags:
  - "TypeScript"
  - "NodeJS"
  - "TypeORM"
  - "NestJS"
description: "If you are an experienced Node.js developer and use the TypeORM library in your project, you must have encountered the problem of creating a virtual field in the data model. We need this field in order to be able to return an additional result in the response, but we don't want to store it directly in the database. What you are most likely looking for should be named .addSelectAndMap(), @VirtualColumn() or Computed Column decorator."
socialImage: "./media/thumbnail.jpeg"
---

![Thumbnail](/media/thumbnail.jpeg)

> ❗ The below article is applicable to TypeORM in version 0.2.37 (released on 08/13/2021). Before reading, check if there is already a new version with a solution to this issue: [github.com/typeorm/typeorm/releases](https://github.com/typeorm/typeorm/releases)

If you are an experienced Node.js developer and use the TypeORM library in your project, you must have encountered the problem of creating a virtual field in the data model. We need this field in order to be able to return an additional result in the response, but **we don't want to store it directly in the database**.
What you are most likely looking for should be named `.addSelectAndMap()`, `@VirtualColumn()` or `Computed Column` decorator.

---

The creators of the library know very well about the existing problem. On 03/26/2018, @pleerock [wrote](https://github.com/typeorm/typeorm/issues/1822#issuecomment-376069476) this comment:

> Official solution named addSelectAndMap will come into QueryBuilder in 0.3.0.

Many people have asked the same question over the years.
You can read more here: [#296](https://github.com/typeorm/typeorm/issues/296), [#1822](https://github.com/typeorm/typeorm/issues/1822), [#2498](https://github.com/typeorm/typeorm/issues/2498), [#4703](https://github.com/typeorm/typeorm/pull/4703), [#6855](https://github.com/typeorm/typeorm/pull/6855), [#7008](https://github.com/typeorm/typeorm/issues/7008).

This issue has not been officially resolved so far.

---

In this article, I will show you all possible ways to deal with this problem. 
I sorted them out from the most insufficient to the one which fully solves this issue.

_For this article, I'm working with Nest.js framework and PostgreSQL. However, 
I am convinced that you will definitely be able to implement it in another Node.js framework, e.g. Express.js._

_I have also [prepared a repository](https://github.com/pietrzakadrian/nestjs-typeorm-virtualcolumn) on github for you, in case you have any problems or want to copy the code. (each branch is a single solution)_

## 1. Non-selectable column

The weakest solution to this problem is to create an additional field in the model with parameters that prevent SQL operations: _SELECT_, _INSERT_, _UPDATE_.

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  @Column({ select: false, nullable: true, insert: false, update: false })
  public fullName: string;
}
```

The column **will not be included** in the model until you use the `.addSelect()` function.

```typescript
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async getUser(): Promise<UserEntity | undefined> {
    const queryBuilder = this._userRepository.createQueryBuilder("user");

    queryBuilder.addSelect(
      "user.firstName || ' ' || user.lastName",
      "user_fullName"
    );

    return queryBuilder.getOne();
  }
}
```

Your controller will run the following SQL query:

```sql
SELECT
	"user"."id" AS "user_id",
	"user"."firstName" AS "user_firstName",
	"user"."lastName" AS "user_lastName",
	"user"."firstName" || ' ' || "user"."lastName" AS "user_fullName"
FROM
	"users" "user"
```

And will return the following result in response:

```json
{
  "id": 1,
  "firstName": "Adrian",
  "lastName": "Pietrzak",
  "fullName": "Adrian Pietrzak"
}
```

This is fine but also has very big drawback: after compiling the code, it adds 
a new column in the database.

```sql
ALTER TABLE "public"."users"
	ADD "fullName" character varying
```

This is not a correct solution. We should not create strange structures in the database to be able to correctly return the result of the SQL operation. ❌

> thank u, next

## 2. getRaw() method

Another, still inadequate, solution is to use the built-in `.getRawOne()` or `.getRawMany()` functions.

All you need to do is attach the `.addSelect()` to the query and execute your business logic in it. The function `.getRawOne()` will return the result that matches the executed SQL query.

```typescript
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async getUser(): Promise<UserEntity | undefined> {
    const queryBuilder = this._userRepository.createQueryBuilder("user");

    queryBuilder.addSelect(
      "user.firstName || ' ' || user.lastName",
      "user_fullName"
    );

    return queryBuilder.getRawOne();
  }
}
```

The SQL query will be formulated as follows (same as above):

```sql
SELECT
	"user"."id" AS "user_id",
	"user"."firstName" AS "user_firstName",
	"user"."lastName" AS "user_lastName",
	"user"."firstName" || ' ' || "user"."lastName" AS "user_fullName"
FROM
	"users" "user"
```

And your json payload will look like this:

```json
{
  "user_id": 1,
  "user_firstName": "Adrian",
  "user_lastName": "Pietrzak",
  "user_fullName": "Adrian Pietrzak"
}
```

Formally, we have achieved the goal. Now we can add an extensive query to our model. Unfortunately, as you may have noticed, the `.getRawOne()` function does not return the mapped object. Now the output may not match the Swagger documentation and this causes additional problems.
Also unacceptable solution. ❌

## 3. Subscriber method

This solution is most often chosen by developers. It uses the subscriber `@AfterLoad()` to append each time the given result to the loaded model. Let's look at prepared code:

First, create an additional variable (not a column) in your model:

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  public fullName: string;
}
```

Next, create a Subscriber class that will perform the intended action. Remember to load it in the appropriate place in the source code:

```typescript
import { EntitySubscriberInterface, EventSubscriber } from "typeorm";
import { UserEntity } from "../entities/user.entity";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo() {
    return UserEntity;
  }

  async afterLoad(user: UserEntity): Promise<void> {
    user.fullName = user.firstName + " " + user.lastName;
  }
}
```

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserSubscriber } from "src/user/subscribers/user.subscriber";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_HOST"),
        port: configService.get("POSTGRES_PORT"),
        username: configService.get("POSTGRES_USERNAME"),
        password: configService.get("POSTGRES_PASSWORD"),
        database: configService.get("POSTGRES_DB_NAME"),
        entities: [__dirname + "/../**/*.entity.{js,ts}"],
        synchronize: true,
        logging: true,
        subscribers: [UserSubscriber],
      }),
    }),
  ],
})
export class DatabaseModule {}
```

Our user service remains unchanged:

```typescript
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async getUser(): Promise<UserEntity | undefined> {
    const queryBuilder = this._userRepository.createQueryBuilder("user");

    return queryBuilder.getOne();
  }
}
```

Now the controller will execute the following SQL query:

```sql
SELECT
	"user"."id" AS "user_id",
	"user"."firstName" AS "user_firstName",
	"user"."lastName" AS "user_lastName"
FROM
	"users" "user"
```

But before returning the response, it append code to the output that subscriber executes:

```json
{
  "id": 1,
  "firstName": "Adrian",
  "lastName": "Pietrzak",
  "fullName": "Adrian Pietrzak"
}
```

Many programmers could now consider the solution to be correct. **Not exactly.** As I wrote earlier, your business logic will now **be executed every time you try to load entity**. Also when using the `.innerJoinAndSelect()` function! If you now return 25 users simultaneously, your code with the virtual field will be executed 25 times.

You don't always need to include your complicated calculations. By using the event listener, you have no control over it.

Better than before, but still not perfect. ❌

## 4. loadRelationCountAndMap() method

If you only need to pass count tightly nested relationship, you can use the built-in `.loadRelationCountAndMap()` function.
This allows for an extensive query.

The syntax looks like this:

```typescript
public async getUser(): Promise<UserEntity> {
    const queryBuilder = this._userRepository.createQueryBuilder('user');

    queryBuilder
       .loadRelationCountAndMap(
         "images",
         qb => qb.andWhere("images.isRemoved = :isRemoved", { isRemoved: true }));

    return queryBuilder.getOne();
}
```

This is a very good solution. It will always return a number, but you can also use it as boolean data. ✅

## 5. Decorator method

It would be ideal if we had a built-in `@VirtualColumn()` decorator that we declare in our model and when we use `.addSelect()` the result will be assigned to that key. So let's just program it.

Let's start by creating a decorator:

```typescript
import "reflect-metadata";

export const VIRTUAL_COLUMN_KEY = Symbol("VIRTUAL_COLUMN_KEY");

export function VirtualColumn(name?: string): PropertyDecorator {
  return (target, propertyKey) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, target) || {};

    metaInfo[propertyKey] = name ?? propertyKey;

    Reflect.defineMetadata(VIRTUAL_COLUMN_KEY, metaInfo, target);
  };
}
```

Now we can import it into our entity and assign it to a new field:

```typescript
import { VirtualColumn } from "src/database/decorators/virtual-column.decorator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  @VirtualColumn()
  public fullName: string;
}
```

Now we need to override the core TypeORM functions `.getOne()` and `.getMany()`. **No worries!** We won't break it. We will add a few lines of code that our decorator will understand.

```typescript
import { VIRTUAL_COLUMN_KEY } from "src/database/decorators/virtual-column.decorator";
import { SelectQueryBuilder } from "typeorm";

declare module "typeorm" {
  interface SelectQueryBuilder<Entity> {
    getMany(this: SelectQueryBuilder<Entity>): Promise<Entity[] | undefined>;
    getOne(this: SelectQueryBuilder<Entity>): Promise<Entity | undefined>;
  }
}

SelectQueryBuilder.prototype.getMany = async function () {
  const { entities, raw } = await this.getRawAndEntities();

  const items = entities.map((entitiy, index) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entitiy) ?? {};
    const item = raw[index];

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entitiy[propertyKey] = item[name];
    }

    return entitiy;
  });

  return [...items];
};

SelectQueryBuilder.prototype.getOne = async function () {
  const { entities, raw } = await this.getRawAndEntities();
  const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entities[0]) ?? {};

  for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
    entities[0][propertyKey] = raw[0][name];
  }

  return entities[0];
};
```

You need to implement our code in the right place for it to be compiled:

```diff
import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { DatabaseModule } from '../database/database.module';
+ import './polyfill';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().allow(''),
        POSTGRES_DB_NAME: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

```

I extended the user service, added an additional method to it that returns multiple users, and added the `.addSelect()` function:

```typescript
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async getUsers(): Promise<UserEntity[] | undefined> {
    const queryBuilder = this._userRepository.createQueryBuilder("user");

    queryBuilder.addSelect(
      "user.firstName || ' ' || user.lastName",
      "fullName"
    );

    return queryBuilder.getMany();
  }

  public async getUser(): Promise<UserEntity | undefined> {
    const queryBuilder = this._userRepository.createQueryBuilder("user");

    queryBuilder.addSelect(
      "user.firstName || ' ' || user.lastName",
      "fullName"
    );

    return queryBuilder.getOne();
  }
}
```

I created an additional controller to run my functions:

```typescript
import { Controller, Get } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserService } from "../services/user.service";

@Controller("Users")
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get("many")
  public async getUsers(): Promise<UserEntity[] | undefined> {
    return this._userService.getUsers();
  }

  @Get("one")
  public async getUser(): Promise<UserEntity | undefined> {
    return this._userService.getUser();
  }
}
```

Now, when I add the `.addSelect()` and assign the result to the virtual column name, the app will perform the following SQL operation:

```sql
SELECT
	"user"."id" AS "user_id",
	"user"."firstName" AS "user_firstName",
	"user"."lastName" AS "user_lastName",
	"user"."firstName" || ' ' || "user"."lastName" AS "fullName"
FROM
	"users" "user"
```

And it will return the mapped model for the `.getOne()` and `.getMany()` functions, as you always wanted. 🎉

```json
{
  "id": 1,
  "firstName": "Adrian",
  "lastName": "Pietrzak",
  "fullName": "Adrian Pietrzak"
}
```

```json
[
  {
    "id": 1,
    "firstName": "Adrian",
    "lastName": "Pietrzak",
    "fullName": "Adrian Pietrzak"
  },
  {
    "id": 2,
    "firstName": "Adrian",
    "lastName": "Mydłowski",
    "fullName": "Adrian Mydłowski"
  },
  {
    "id": 3,
    "firstName": "Mateusz",
    "lastName": "Polski",
    "fullName": "Mateusz Polski"
  }
]
```

Now we are able to attach any query to our model without any problems,
**as you've always wanted**. ✅

---

You can also find this article on [medium.com](https://medium.com/@pietrzakadrian) where I share my solutions to the problems I encountered during my software engineer career.

If you have additional questions, you can write to me on [LinkedIn](https://www.linkedin.com/in/pietrzakadrian/) or [Twitter](https://twitter.com/pietrzakadrian/).
