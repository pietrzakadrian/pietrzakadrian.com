---
title: How to create pagination in Nest.js with TypeORM + Swagger
date: "2021-09-03T22:40:32.169Z"
template: "post"
draft: false
slug: "/blog/how-to-create-pagination-in-nestjs-with-typeorm-swagger"
category: "Software Engineering"
tags:
  - "TypeScript"
  - "NodeJS"
  - "TypeORM"
  - "NestJS"
description: "Pagination is a very important part of your API. It requires and is used in almost every CRUD application. In this article, I'll show you how to design it well using the Nest.js framework and TypeORM. In addition, I will correctly display it in Swagger, because it turns out that it is not so simple. 🧐"
socialImage: "./media/thumbnail.jpeg"
---

![Thumbnail](/media/thumbnail.jpeg)

Pagination is a very important part of API. It requires and is used in almost every CRUD application.

In this article, I'll show you how to design it well using the Nest.js framework and TypeORM. In addition, I will correctly display it in Swagger, because it turns out that it is not so simple. 🧐

> **Note**: I have [prepared a repository](https://github.com/pietrzakadrian/nestjs-typeorm-pagination) for you with source code ready in case you cannot copy the code.

## 1. Create a data model

A list of users registered in database will be displayed. Each user has a first and last name. Additionally, each record has its own unique id number and creation date.

```typescript
import { AbstractEntity } from "src/common/entities";
import { Column, Entity } from "typeorm";

@Entity({ name: "users" })
export class UserEntity extends AbstractEntity {
  @Column()
  public firstName: string;

  @Column()
  public lastName: string;
}
```

User Entity class extends from an abstract class with fields common to other models. I also use the `@Exclude` decorator because I don't want to show this data in the response.

```typescript
import { Exclude } from "class-transformer";
import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  public id: number;

  @CreateDateColumn()
  @Exclude()
  public createdAt: Date;
}
```

We also need a user repository. You should know that. I do this only to make the article complete.

```typescript
import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { UserEntity } from "../entities/user.entity";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {}
```

Ok, now you know what your database users will look like. 👨‍💻

---

## 2. Create a pagination model

We would now need several DTO classes.

> A Data Transfer Object is an object that is used to encapsulate data, and send it from one subsystem of an application to another.

First, create `page.dto.ts`. This is the skeleton of the received JSON.

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { PageMetaDto } from "./page-meta.dto";

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
```

In the `meta` key is additional info about the pagination of the received data. See the file below to know exactly what this information is.

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { PageMetaDtoParameters } from "../interfaces";

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
```

Since this is written in TypeScript, we also declare an interface.

```typescript
import { PageOptionsDto } from "../dtos";

export interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}
```

We need code to handle our parameters to be passed in queries. I mean page number, number of elements and sorting.

```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Order } from "../constants";

export class PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
```

```typescript
export enum Order {
  ASC = "ASC",
  DESC = "DESC",
}
```

This code uses `validation`, so a global pipe must be declared. You can read more about it in the [official Nest.js documentation](https://docs.nestjs.com/techniques/validation).

```typescript
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
}

bootstrap();
```

---

## 3. Create a service

We will create a service that will perform the business logic.

> **Note**: See [how your Node.js application can be hacked if you use .`findOne()` from the repository instead of `.createQueryBuilder()`](https://pietrzakadrian.com/blog/how-to-hack-your-nodejs-application-which-uses-typeorm).

```typescript
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "src/common/dtos";
import { UserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async getUsers(
    pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this._userRepository.createQueryBuilder("user");

    queryBuilder
      .orderBy("user.createdAt", pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }
}
```

Create an additional file detailing what your user model looks like. This will be needed for proper display in Swagger.

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty()
  public firstName: string;

  @ApiProperty()
  public lastName: string;
}
```

You can also add `@ApiProperty()` decorator to your Entity. Then pass `PageDto<UserEntity>`.\
Anyway, separating it into 2 files is more stylish. 👨‍🎨

---

## 4. Create a controller

Make the controller which will execute our code from the service:

```typescript
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { PageDto, PageOptionsDto } from "src/common/dtos";
import { UserDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";

@Controller("Users")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<UserDto>> {
    return this._userService.getUsers(pageOptionsDto);
  }
}
```

Now when you execute the get request without queries, you'll get the following response:

```json
{
  "data": [
    {
      "firstName": "Adrian",
      "lastName": "Pietrzak"
    },
    {
      "firstName": "John",
      "lastName": "Hills"
    },
    {
      "firstName": "Adam",
      "lastName": "Polaszek"
    },
    {
      "firstName": "Matylda",
      "lastName": "Poznańska"
    },
    {
      "firstName": "Aleksandra",
      "lastName": "Tysińska"
    },
    {
      "firstName": "Aleksandra",
      "lastName": "Piotrowska"
    },
    {
      "firstName": "Mateusz",
      "lastName": "Polaszek"
    },
    {
      "firstName": "Adrian",
      "lastName": "Mydłowski"
    },
    {
      "firstName": "Justyna",
      "lastName": "Stańczyk"
    },
    {
      "firstName": "Ewa",
      "lastName": "Joen"
    }
  ],
  "meta": {
    "page": 1,
    "take": 10,
    "itemCount": 12,
    "pageCount": 2,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

When you add `?page=2`, you will get the next page:

```json
{
  "data": [
    {
      "firstName": "Andrea",
      "lastName": "Sisser"
    },
    {
      "firstName": "Jakub",
      "lastName": "Paw"
    }
  ],
  "meta": {
    "page": 2,
    "take": 10,
    "itemCount": 12,
    "pageCount": 2,
    "hasPreviousPage": true,
    "hasNextPage": false
  }
}
```

or when you do `?take=4`, you get something like this:

```json
{
  "data": [
    {
      "firstName": "Adrian",
      "lastName": "Pietrzak"
    },
    {
      "firstName": "John",
      "lastName": "Hills"
    },
    {
      "firstName": "Adam",
      "lastName": "Polaszek"
    },
    {
      "firstName": "Matylda",
      "lastName": "Poznańska"
    }
  ],
  "meta": {
    "page": 1,
    "take": 4,
    "itemCount": 12,
    "pageCount": 3,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

> **Note**: you can combine it, for example: `?page=2&take=7&order=DESC`.

---

## 5. Setup Swagger documentation

When you are make a professional software, solid documentation of your api is needed. It's a bit complicated, but we can do it! 💪

First you need to create a swagger decorator:

```typescript
import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { PageDto } from "src/common/dtos";

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel
) => {
  return applyDecorators(
    ApiExtraModels(PageDto),
    ApiOkResponse({
      description: "Successfully received model list",
      schema: {
        allOf: [
          { $ref: getSchemaPath(PageDto) },
          {
            properties: {
              data: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    })
  );
};
```

Connect the swagger module to the application as it is written in the [documentation](https://docs.nestjs.com/openapi/introduction).

```typescript
import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle("NestJS TypeORM Pagination")
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("documentation", app, document);
}
```

```diff
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
+ import { setupSwagger } from './util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

+ setupSwagger(app);

  await app.listen(3000);
}

bootstrap();
```

The last step is to add decorator to the controller.

```diff
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
+ import { ApiTags } from '@nestjs/swagger';
+ import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { PageDto, PageOptionsDto } from 'src/common/dtos';
import { UserDto } from '../dtos/user.dto';
import { UserService } from '../services/user.service';

@Controller('Users')
+ @ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
+ @ApiPaginatedResponse(UserDto)
  async getUsers(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this._userService.getUsers(pageOptionsDto);
  }
}
```

Now when you go to `http://localhost:3000/documentation`, you will get the documentation for your ending address correctly displayed! 🎉

![abstract.entity.ts](/media/3/20.png)

---

You can also find this article on [medium.com](https://medium.com/@pietrzakadrian) where I share my solutions to the problems I encountered during my software engineer career.

If you have additional questions, you can write to me on [LinkedIn](https://www.linkedin.com/in/pietrzakadrian/) or [Twitter](https://twitter.com/pietrzakadrian/).
