---
title: 🚨 How to hack your Node.js application (which uses TypeORM)?
date: "2021-08-29T20:40:32.169Z"
template: "post"
draft: false
slug: "how-to-hack-your-nodejs-application-which-uses-typeorm"
category: "IT security"
tags:
  - "TypeScript"
  - "NodeJS"
  - "TypeORM"
  - "NestJS"
description: "Among Node.js developers there is a constant struggle to choose the best ORM library. I most often choose TypeORM in my projects and although I think it is the best ORM, it has its drawbacks.
In today's article, I'll show you how you can stupidly make a huge mistake and let your application be hacked by accidentally granting root access. It may sound spicy, but it is! 🌶"
socialImage: "/media/thumbnail.jpeg"
---

![Thumbnail](/media/thumbnail.jpeg)

> **Note**: The below article is applicable to TypeORM in version 0.2.37 (released on 08/13/2021). Before reading, check if there is already a new version with a solution to this issue: [github.com/typeorm/typeorm/releases](https://github.com/typeorm/typeorm/releases)

Among Node.js developers there is a constant struggle to choose the best ORM library. I most often choose TypeORM in my projects and although I think it is the best ORM, it has its drawbacks.

In today's article, I'll show you how you can stupidly make a huge mistake and let your application be hacked by accidentally granting root access. It may sound spicy, **but it is**! 🌶

For the purposes of this article, I have prepared a simple application using Nest.js framework with user authorization and access roles. You can find the repository with source code [here](https://github.com/pietrzakadrian/nestjs-typeorm-findone).

---

## General problem

The problem applies to the function `.findOne()` available in the entity repository. Most CRUD applications use this method. It's about searching for a record.

When you pass `null` or `undefined` to the argument, **you always get the first result in the table as a result**!

```typescript
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async getUser(): Promise<UserEntity> {
    return this._userRepository.findOne(null || undefined);
  }
}
```

The contributors of the library are well aware of this problem. This is where the discussion takes place: [#2500](https://github.com/typeorm/typeorm/issues/2500). On 16 May 2020, @pleerock [wrote](https://github.com/typeorm/typeorm/issues/2500#issuecomment-629549738) the following comment:

> Since this is a breaking, fix will be available in the next branch.

Unfortunately, after more than a year, in spite of the release of newer versions, the bug still has not been fixed. It doesn't look good. 😏

---

## Why is it dangerous to your Node.js application?

The `.findOne()` function with the argument `null` or `undefined` will execute the following SQL query:

```sql
SELECT
	"UserEntity"."id" AS "UserEntity_id",
	"UserEntity"."firstName" AS "UserEntity_firstName",
	"UserEntity"."lastName" AS "UserEntity_lastName",
	"UserEntity"."username" AS "UserEntity_username",
	"UserEntity"."password" AS "UserEntity_password",
	"UserEntity"."role" AS "UserEntity_role",
	"UserEntity"."createdAt" AS "UserEntity_createdAt"
FROM
	"users" "UserEntity"
LIMIT 1
```

As you can see, there is no `WHERE` statement. This means it will return the first result from the table.\
And do you know who the first user in the database is usually?

```json
{
  "id": 1,
  "firstName": "Adrian",
  "lastName": "Pietrzak",
  "username": "contact@pietrzakadrian.com",
  "password": "$2b$10$93pNQaRzK4JxddXLawC98euwXDNXocOh0hHVbatO1Up0DWJCBjOzK",
  "role": "ADMIN_ROLE",
  "createdAt": "2021-08-27T09:02:47.661Z"
}
```

Yes, this is an administrator account. 😳

---

## How can this software be hacked?

If you are programming in TypeScript, the chance of making this mistake is impossible. 💙\
However, most node.js applications are written in JavaScript, which does not care about the proper and existing types. Now I will show you how to make a mistake that will cost us a lot.

Look, this is what my JWT token looks like with a logged in user:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTYzMDA1NTA0MCwiZXhwIjoxNjMwMDU4NjQwfQ.rlNavGjpS4x-_AgL5CwZvhpmMi50FJm7Rp-PK6_d-0Y
```

It contains the following structure after decoding:

```json
{
  "userId": 2,
  "iat": 1630055040,
  "exp": 1630058640
}
```

> **Note**: The user with id **2** is a regular user with the `USER_ROLE` role.

Now, after logging in, I want to call the controller to receive data about me:

```typescript
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthenticationGuard } from "src/auth/guards/jwt-authentication.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { RequestWithUser } from "src/auth/interfaces/request-with-user.interface";
import { RoleType } from "../constants/role-type.constant";
import { UserEntity } from "../entities/user.entity";

@Controller("Users")
export class UserController {
  @Get()
  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  public async getUser(@Req() request: RequestWithUser): Promise<UserEntity> {
    return request.user;
  }
}
```

This controller is only available for the `ADMIN_ROLE` role. Decorators in TypeScript are read from bottom to top, so first I am using the JWT authentication guard which is written like this:

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthenticationGuard extends AuthGuard("jwt") {}
```

This is related to the following strategy:

```typescript
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserEntity } from "src/user/entities/user.entity";
import { UserService } from "src/user/services/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: configService.get("JWT_SECRET"),
    });
  }

  /**
   * @param payload here is the decoded data from JWT token, e.g. { userId: 2, ... }
   */
  async validate(payload): Promise<UserEntity> {
    return this.userService.getUserById(payload);
  }
}
```

As you can see, I use the `.getUserById(payload)` method to verify the user by the id encrypted in the token. I'm passing a payload object and trying to find a user for `payload.id`. **Such a key does not exist in the object!** The user id is in the `payload.userId` key, so `payload.id` **is undefined**!

```typescript
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async getUserById(payload): Promise<UserEntity> {
    console.log(payload.userId); // 2
    console.log(payload.id); // undefined

    return this._userRepository.findOne(payload.id);
  }
}
```

```curl
curl --location --request GET 'http://localhost:3000/users' \
--header 'Content-Type: application/json' \
--header 'Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTYzMDA1NTA0MCwiZXhwIjoxNjMwMDU4NjQwfQ.rlNavGjpS4x-_AgL5CwZvhpmMi50FJm7Rp-PK6_d-0Y'
```

> **Note**: You can decode this JWT token yourself here: [https://jwt.io](https://jwt.io)

This will perform the SQL operation:

```sql
SELECT
	"UserEntity"."id" AS "UserEntity_id",
	"UserEntity"."firstName" AS "UserEntity_firstName",
	"UserEntity"."lastName" AS "UserEntity_lastName",
	"UserEntity"."username" AS "UserEntity_username",
	"UserEntity"."password" AS "UserEntity_password",
	"UserEntity"."role" AS "UserEntity_role",
	"UserEntity"."createdAt" AS "UserEntity_createdAt"
FROM
	"users" "UserEntity"
LIMIT 1
```

And we get the same result as above:

```json
{
  "id": 1,
  "firstName": "Adrian",
  "lastName": "Pietrzak",
  "username": "contact@pietrzakadrian.com",
  "password": "$2b$10$93pNQaRzK4JxddXLawC98euwXDNXocOh0hHVbatO1Up0DWJCBjOzK",
  "role": "ADMIN_ROLE",
  "createdAt": "2021-08-27T09:02:47.661Z"
}
```

I am logged in as user with id = **1** and now I have access to all controllers with the `ADMIN_ROLE` role! 🎉🤯

---

## How to fix this threat?

**Stop using `.findOne()` directly from the repository!** This is convenient, but you don't have complete control over the SQL queries. Instead, always make your queries with `.createQueryBuilder()`:

```typescript
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  async getUserById(id: number): Promise<UserEntity> {
    const queryBuilder = this._userRepository.createQueryBuilder("user");

    queryBuilder.where("user.id = :id", { id });

    return queryBuilder.getOne();
  }
}
```

Even if you pass `null` to the argument, the SQL will be properly formulated:

```sql
SELECT
	"UserEntity"."id" AS "UserEntity_id",
	"UserEntity"."firstName" AS "UserEntity_firstName",
	"UserEntity"."lastName" AS "UserEntity_lastName",
	"UserEntity"."username" AS "UserEntity_username",
	"UserEntity"."password" AS "UserEntity_password",
	"UserEntity"."role" AS "UserEntity_role",
	"UserEntity"."createdAt" AS "UserEntity_createdAt"
FROM
	"users" "UserEntity"
WHERE
	"user"."id" = $1 -- PARAMETERS: [null]
```

This SQL operation will return an empty result, not the first record in the database. Now our code is completely safe. 🔐

---

You can also find this article on [medium.com](https://medium.com/@pietrzakadrian) where I share my solutions to the problems I encountered during my software engineer career.

If you have additional questions, you can write to me on [LinkedIn](https://www.linkedin.com/in/pietrzakadrian/) or [Twitter](https://twitter.com/pietrzakadrian/).
