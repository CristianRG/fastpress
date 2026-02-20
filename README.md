# Fastpress

Fastpress is an open-source project designed to empower developers to build backend applications easily. It features a clean, modern syntax inspired by major frameworks like SpringBoot, bringing that familiar structure to Node.js with TypeScript.

## Features

- **Integrated Daemon**: Includes a development mode that monitors .ts files. The server restarts automatically upon changes, eliminating the need for manual restarts.

- **Automatic Controller Discovery**: No more manual registration. Your controllers (entry points) are automatically detected and registered by the system.

- **Decorator-based Architecture**: Use decorators to register new controllers, define HTTP methods, apply middlewares, pipes, and more.

- **Prisma Integration**: Powered by Prisma ORM for maximum flexibility and type safety. It is currently the primary database manager for the framework.

- **Base Controllers**: Jumpstart your CRUD operations by extending a **Base** class. This provides out-of-the-box functionality to get all records, find by ID, create, update, and delete without writing boilerplate code.

- **Hooks**: Events that are executed before and after a specific method is called. They allow data transformations, integration of elements into the request, and more.

- **Centralized Configuration**: Allows you to change the behavior of certain elements in the application, such as the Prisma adapter or the logging system, through a centralized configuration file.

- **Authentication**: Includes an authentication controller and middleware by default, using JWT for a token-based authentication method with refresh tokens and access tokens.


## Usage Example

Fastpress uses decorators and Zod schemas to keep your code clean and validated:

```typescript
const CreateUserSchema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    age: z.number().int().min(18).optional()
});

@UseMiddleware(Auth, Sanitizer)
@Controller("/users")
class UserController {

    @Get("/")
    getAll(
        @Query("page", ParseIntPipe) page: number = 1,
        @Query("limit", ParseIntPipe) limit: number = 10
    ) {
        return new ServerResponse(200, "Users list", {
            users: [], 
            pagination: { page, limit, total: 0 }
        });
    }

    @Post("/")
    create(
        @Body(undefined, new ZodValidationPipe(CreateUserSchema)) data: z.infer<typeof CreateUserSchema>,
        @User() user: UserModel
    ) {
        return new ServerResponse(201, "User created", { data, createdBy: user });
    }
}
```

## Installation and Setup
Follow these steps to get your environment ready:

### 1) Clone the Repository
Run the following command in your workspace to get the source code:

```bash
git clone https://github.com/CristianRG/fastpress.git
```

### 2) Install Dependencies
Install the required packages using pnpm or npm:

```bash
pnpm install
# or
npm install
```

### 3) Prisma Configuration
To start using the Prisma ORM, you need to make some configurations:

Configure Prisma. You can customize the `prisma.config.ts` file and an `.env` file with your database connection URL:

```ts
// This is the default file provided by prisma
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

Create your .env file. You must create a .env file with the following variable:

```bash
DATABASE_URL=<your_database_url>
```

**Note:** Before proceeding, define your database provider in `prisma/schema.prisma` (this file is included in the repository because it contains authentication models required by the system) under the datasource block:

```javascript
datasource db {
  provider = "sqlite" // Define your provider here
}
```

Install the specific adapter for your chosen provider. For more details, refer to the official Prisma [documentation](https://www.prisma.io/docs/orm/overview/databases).

Configure the adapter in the [Fastpress Config File](fastpress.config.ts). By default, it will be using `PrismaBetterSqlite3`, but once you've installed your provider, you can change this instance to yours and uninstall the default provider.

```typescript
server: {
        // Some other configurations...
        prismaAdapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' }),
    },
```

Once configured, define your models in `prisma/schema.prisma` and generate the types:

This creates a generated folder containing all the types Prisma needs to function and syncs your database with the models schema:

```bash
pnpx prisma db push
```

If the folder was not generated, you can run the following command:

```bash
pnpx prisma generate
```

### 4) Run the Project
With everything configured, you are ready to start the server.

**Development mode:**

```bash
pnpm run dev
```

**Production mode:**

```bash
pnpm run production
```

## Roadmap
Fastpress is in its early stages. Future milestones include:

- **Automated Prisma Setup**: A CLI-guided setup to install drivers automatically based on the selected database provider.

- **CLI Scaffolding**: Commands like `npx fastpress generate` to automatically create controllers in the modules folder based on your database models (including flags to overwrite or skip files).

- **Official CLI**: An `npx create fastpress` command to bootstrap new projects instantly.

- **Dependency Abstraction**: Decouple the core to allow alternatives to Prisma or custom logging libraries.

- **Testing Suite**: Built-in utilities to ensure application behavior remains consistent.

## Motivation

Initially, it was just a simple server using Express syntax, as it was intended to be an embedded server within a desktop application using Electron. However, with the constant implementation of new modules, the application grew to a point where it seemed unsustainable.

Then Fastpress was born. Using modern syntax similar to frameworks like SpringBoot, it became possible to organize each new module in a simpler way, as they don't need to be manually imported into a file where the main instance is located along with other modules. Additionally, it features clean and easy-to-understand syntax.

Although it's a small project that I maintain alone, I hope it will be useful to anyone interested, and that both you and I can learn a lot by developing this project. Even better, I would love to see what new features you can implement. 

## Useful Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [Database Drivers Guide](https://www.prisma.io/docs/orm/overview/databases)

## License
>This project is licensed under the MIT License.

## Author
Created with 💙 by CristianRG