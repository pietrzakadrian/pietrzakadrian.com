---
title: How to create a microservice that handles 🎢 the queue of sending emails in NestJS
date: "2021-12-01T12:40:32.169Z"
template: "post"
draft: false
slug: "how-to-create-a-microservice-that-handles-the-queue-of-sending-emails-in-nestjs"
category: "Software Engineering"
tags:
  - "NodeJS"
  - "TypeScript"
  - "NestJS"
description: In this article, I will present you independent microservice that handles the queue of sending emails using the Node.js platform with the NestJS framework. The use of this microservice allows you to decouple the business logic of the email senders from the main monolithic application, resulting in less use of server resources and therefore faster source code execution.
socialImage: "/media/thumbnail.jpeg"
---

![Thumbnail](/media/thumbnail.jpeg)

In this article, I will present you independent microservice that handles the queue of sending emails using the Node.js platform with the NestJS framework.

The use of this microservice allows you to decouple the business logic of the email senders from the main monolithic application, resulting in less use of server resources and therefore faster source code execution.

> **Note**: As usual, I have prepared a ready-made repository for you with code from this article.\
> You can find it [here](https://github.com/pietrzakadrian/nestjs-mailer-microservice).

> **Note**: This article is an expanded version of [this post](https://firxworx.com/blog/coding/nodejs/email-module-for-nestjs-with-bull-queue-and-the-nest-mailer/). It contains better described source code and microservice implementations.

---

## Architecture of microservice

I have tried to keep this software as simple as possible. Below is the directory structure:

```
.
├── app
│   └── index.ts
├── mail
│   ├── constants
│   │   ├── mail.constant.ts
│   │   └── index.ts
│   ├── controllers
│   │   ├── mail.controller.ts
│   │   └── index.ts
│   ├── processors
│   │   ├── mail.processor.ts
│   │   └── index.ts
│   ├── services
│   │   ├── mail.service.ts
│   │   └── index.ts
│   ├── templates
│   │   └── registration.hbs
│   ├── tests
│   │   ├── mail.controller.spec.ts
│   │   └── mail.service.spec.ts
│   └── index.ts
└── main.ts
```

As you can see, there are only a few files and I will guide you through each one.

---

## 1. Installation and configuration of project files

According to the [official NestJS documentation](https://docs.nestjs.com/microservices/basics), to create a microservice you need to install the `@nestjs/microservices` module in the [NestJS starter application](https://docs.nestjs.com/#installation).

This version of the software is more professional, so we'll install a bit more of them.\
Execute these two lines of code in your terminal while in the root directory of the project.

```
yarn add @nestjs/microservices @nestjs/bull @nestjs-modules/mailer @hapi/joi bull handlebars nodemailer @nestjs/config
```

```
yarn add @types/bull @types/hapi__joi @types/nodemailer --dev
```

You will be using the handlebars template engine, which uses the **.hbs** file format. NestJS needs to know this because by default it only compiles files containing TypeScript code.

Edit the **nest-cli.json** file, which is located in the root directory of the project.

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "assets": ["mail/templates/**/*"]
  }
}
```

> **Note**: You will need redis installed on your server to support the queue. The configuration of this database is simple. Installing it goes beyond the topic of this article. Consult the documentation on the [official redis website](https://redis.io/).

---

## 2. Environment variables

It's time to create the first file. So let's start by configuring the environment variables. Create an **.env** file in the root directory of your project:

```
# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_ADDRESS=mailer-microservice@gmail.com
EMAIL_PASSWORD=P4ssw0rd!$

# Redis Settings
REDIS_HOST=localhost
REDIS_PORT=6379
```

> **Note**: If you want to use gmail to send emails, remember to [enable access to less secure applications](https://myaccount.google.com/lesssecureapps).

Now we link the environment variables to the main module, which is located in **app/index.ts**:

```typescript
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "@hapi/joi";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("REDIS_HOST"),
          port: +configService.get<number>("REDIS_PORT"),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        EMAIL_HOST: Joi.string().required(),
        EMAIL_PORT: Joi.number().required(),
        EMAIL_ADDRESS: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
  ],
})
export class AppModule {}
```

The **main.ts** file is identical, just like in the official documentation.\
However, I will paste it here just so that this article remains complete.

```typescript
import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { AppModule } from "./app";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, { transport: Transport.TCP });

  app.listen();
}

void bootstrap();
```

---

## 3. Programming the Mail module

Ok, now we can do what tigers 🐅 like the most, which is to program the mail module that will be responsible for all the logic. Let's start with the simplest one, which is programming the constants.

### 3.1. Create the constants file

In the constants directory, create the file **mail.constant.ts**:

```typescript
export const MAIL_QUEUE = "MAIL_QUEUE";
export const CONFIRM_REGISTRATION = "CONFIRM_REGISTRATION";
```

> **Note**: You may have already noticed that each directory contains an **index.ts** file. It contains an export of the entire contents of all files in that directory. This allows for elegant import paths.

```typescript
export * from "./mail.constant";
```

`MAIL_QUEUE` is a variable representing the name of the queue, and `CONFIRM_REGISTRATION` is the name of the process being executed. In our case, we are creating an account registration confirmation mailing.

### 3.2. Create a mail template

As I wrote earlier, we use the handlebars template engine. This is a popular solution for Node.js applications. It allows you to pass variables, create loops and more.

Create **registration.hbs** file in templates directory:

```handlebars
<html>
  <head></head>
  <body>
    Yo 😄
    <br />
    <br />
    Thank you for registering in our app.<br />
    Click on the link to confirm your account.<br />
    <br />
    {{confirmUrl}}
  </body>
</html>
```

### 3.3. Create a mail processor

The processor is responsible for processing tasks in the queue. I added comments to places in the code that are very important.

In the processors directory, create **mail.processor.ts** file:

```typescript
import { MailerService } from "@nestjs-modules/mailer";
import { Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Job } from "bull";
import { CONFIRM_REGISTRATION, MAIL_QUEUE } from "../constants";

@Injectable()
@Processor(MAIL_QUEUE)
export class MailProcessor {
  private readonly _logger = new Logger(MailProcessor.name);

  constructor(private readonly _mailerService: MailerService, private readonly _configService: ConfigService) {}

  @Process(CONFIRM_REGISTRATION) // here is the name of the executed process
  public async confirmRegistration(job: Job<{ emailAddress: string; confirmUrl: string }>) {
    this._logger.log(`Sending confirm registration email to '${job.data.emailAddress}'`);

    try {
      return this._mailerService.sendMail({
        to: job.data.emailAddress,
        from: this._configService.get("EMAIL_ADDRESS"),
        subject: "Registration",
        template: "./registration", // ! it must point to a template file name without the .hbs extension
        context: { confirmUrl: job.data.confirmUrl }, // here you pass the variables that you use in the hbs template
      });
    } catch {
      this._logger.error(`Failed to send confirmation email to '${job.data.emailAddress}'`);
    }
  }
}
```

If you want more information about queued tasks, you can add an additional 3 methods:

```typescript
@OnQueueActive()
public onActive(job: Job) {
  this._logger.debug(`Processing job ${job.id} of type ${job.name}`);
}

@OnQueueCompleted()
public onComplete(job: Job) {
  this._logger.debug(`Completed job ${job.id} of type ${job.name}`);
}

@OnQueueFailed()
public onError(job: Job<any>, error: any) {
  this._logger.error(
    `Failed job ${job.id} of type ${job.name}: ${error.message}`,
    error.stack,
  );
}
```

> **Note**: You can read more about queues in the [official NestJS documentation](https://docs.nestjs.com/techniques/queues).

### 3.4. Create a mail service

We will now program a service to add a new task (i.e. sending an email) to the queue.\
In the services directory, create a file named **mail.service.ts**:

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { CONFIRM_REGISTRATION, MAIL_QUEUE } from "../constants";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";

@Injectable()
export class MailService {
  private readonly _logger = new Logger(MailService.name);

  constructor(@InjectQueue(MAIL_QUEUE) private readonly _mailQueue: Queue) {}

  public async sendConfirmationEmail(emailAddress: string, confirmUrl: string): Promise<void> {
    try {
      await this._mailQueue.add(CONFIRM_REGISTRATION, {
        emailAddress,
        confirmUrl,
      });
    } catch (error) {
      this._logger.error(`Error queueing registration email to user ${emailAddress}`);

      throw error;
    }
  }
}
```

I think this method is simple enough that there is no need to describe it.

### 3.5. Create a mail controller

Once we have the service and processor programmed, we need to create a controller to run it all.\
Create a **mail.controller.ts** file in the controllers directory.

```typescript
import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";
import { MailService } from "../services";

@Controller()
export class MailController {
  constructor(private readonly _mailService: MailService) {}

  @EventPattern({ cmd: "send-message" })
  async sendConfirmationEmail(emailAddress: string, confirmUrl: string): Promise<void> {
    return this._mailService.sendConfirmationEmail(emailAddress, confirmUrl);
  }
}
```

> **Note**: this microservice will listen for the `send-message` command. You can read more about it [here](https://docs.nestjs.com/microservices/basics#event-based).

### 3.6. Inject created classes into the main module file

We already have everything we need. We just need to combine it in the main module file.

```typescript
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { BullModule } from "@nestjs/bull";
import { MAIL_QUEUE } from "./constants";
import { MailProcessor } from "./processors";
import { MailService } from "./services";
import { MailController } from "./controllers";

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get("EMAIL_HOST"),
          port: +configService.get("EMAIL_PORT"),
          secure: true,
          auth: {
            user: configService.get("EMAIL_ADDRESS"),
            pass: configService.get("EMAIL_PASSWORD"),
          },
          tls: { rejectUnauthorized: false },
        },
        defaults: { from: '"NestJS Mailer" <test@test.com>' }, // the header of the received emails is defined here. Customize this for your application.
        template: {
          dir: __dirname + "/templates", // here you must specify the path where the directory with all email templates is located
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
  ],
  providers: [MailProcessor, MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
```

Do not forget to import the created module into the main module of the application:

```diff
...
+ import { MailModule } from 'src/mail';

@Module({
  imports: [
    ...
+   MailModule,
  ],
})
export class AppModule {}
```

So that's it. We have the whole module programmed and ready to use! 🚀\
You can now compile the application and run it on an external server.

---

## Example of use

Implementing a microservice in NestJS is trivially easy. We need to import a specific module for connection and apply it to our service.
In our case, we will send an email address when a user is created.

1. First, you need to start microservices in your **main.ts** file (in another NestJS application):

```typescript
...
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  ...

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: configService.get('PORT'),
    },
  });

  app.startAllMicroservices();
}

bootstrap();
```

2. In the module where you will want to use the microservice, declare a new object in the providers array:

```typescript
...
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  ...
  providers: [
    {
      provide: 'MAIL_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
        }),
    },
  ],
})
export class AuthenticationModule {}
```

`MAIL_SERVICE` is the name of the microservice. You will refer to it through the constructor in the service.

3. Now apply the client at the appropriate place in your business logic:

```typescript
...
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject('MAIL_SERVICE') private client: ClientProxy,
  ) {}

  ...

   public async registration({ emailAddress }: RegistrationDto): Promise<UserEntity> {
     ...

     const confirmUrl = "https://link.test?ey=testexample2"
     return this.subscribersService.emit({ cmd: 'send-message' }, { emailAddress, confirmUrl })
  }
}
```

Remember that the cmd must be identical to the one defined in the microservice controller.
In the second argument, you pass the variables you need to send to the microservice.

That's it, your monolithic application now is associated with the microservice and can use its services. 🙌

---

## Testing the mail module

The more experienced a developer I am, the more I realize how important testing is. My tests aren't perfect, but I'm glad they are.

Below is my test named **mail.controller.spec.ts** for the mail controller:

```typescript
import { BullModule, getQueueToken } from "@nestjs/bull";
import { Test, TestingModule } from "@nestjs/testing";
import { MAIL_QUEUE } from "../constants";
import { MailController } from "../controllers";
import { MailService } from "../services";

describe("MailController", () => {
  let controller: MailController;
  let moduleRef: TestingModule;

  const exampleQueueMock = { add: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: MAIL_QUEUE,
        }),
      ],
      controllers: [MailController],
      providers: [MailService],
    })
      .overrideProvider(getQueueToken(MAIL_QUEUE))
      .useValue(exampleQueueMock)
      .compile();

    controller = moduleRef.get<MailController>(MailController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
```

I also wrote a test for the mail service:

```typescript
import { BullModule, getQueueToken } from "@nestjs/bull";
import { Test, TestingModule } from "@nestjs/testing";
import { Queue } from "bull";
import { MAIL_QUEUE, CONFIRM_REGISTRATION } from "../constants";
import { MailService } from "../services";

describe("MailService", () => {
  let service: MailService;
  let moduleRef: TestingModule;

  const exampleQueueMock = { add: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: MAIL_QUEUE,
        }),
      ],
      providers: [MailService],
    })
      .overrideProvider(getQueueToken(MAIL_QUEUE))
      .useValue(exampleQueueMock)
      .compile();

    service = moduleRef.get<MailService>(MailService);
  });

  it("should inject the queue", () => {
    const queue = moduleRef.get<Queue>(getQueueToken(MAIL_QUEUE));

    expect(queue).toBeDefined();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should dispatch job", async () => {
    await service.sendConfirmationEmail("test@test.com", "http://link.com?token=ey");

    expect(exampleQueueMock.add).toHaveBeenCalledWith(CONFIRM_REGISTRATION, {
      confirmUrl: "http://link.com?token=ey",
      emailAddress: "test@test.com",
    });
  });
});
```

After executing yarn test, you will get the following result:

```
$ jest
 PASS  src/mail/tests/mail.service.spec.ts
 PASS  src/mail/tests/mail.controller.spec.ts
Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        5.225 s
Ran all test suites.
✨  Done in 6.56s.
```

---

In this article, we learned how to implement a queue for sending e-mails using a microservice.
We have written a comprehensive application and prepared tests for it.

You can also find this article on [medium.com](https://medium.com/@pietrzakadrian) where I share my solutions to the problems I encountered during my software engineer career.

If you have additional questions, you can write to me on [LinkedIn](https://www.linkedin.com/in/pietrzakadrian/) or [Twitter](https://twitter.com/pietrzakadrian/).
