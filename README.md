# Fastpress

Fastpress is an open-source project designed to empower developers to build backend applications easily. It features a clean, modern syntax inspired by major frameworks like SpringBoot, bringing that familiar structure to Node.js with TypeScript.

> **TypeScript Required:** Fastpress is a TypeScript-first framework that leverages decorators and advanced TypeScript features. Your application must be written in TypeScript.

## Features

- **Integrated Daemon**: Includes a development mode that monitors .ts files. The server restarts automatically upon changes, eliminating the need for manual restarts.

- **Automatic Controller Discovery**: No more manual registration. Your controllers (entry points) are automatically detected and registered by the system.

- **Decorator-based Architecture**: Use decorators to register new controllers, define HTTP methods, apply middlewares, pipes, and more.

- **Prisma Integration**: Powered by Prisma ORM for maximum flexibility and type safety. It is currently the primary database manager for the framework.

- **Base Controllers**: Jumpstart your CRUD operations by extending a **Base** class. This provides out-of-the-box functionality to get all records, find by ID, create, update, and delete without writing boilerplate code.

- **Hooks**: Events that are executed before and after a specific method is called. They allow data transformations, integration of elements into the request, and more.

- **Centralized Configuration**: Allows you to change the behavior of certain elements in the application, such as the Prisma adapter or the logging system, through a centralized configuration file.

- **Authentication Module**: Includes a ready-to-use authentication controller and service with JWT-based authentication (access tokens and refresh tokens). Simply import and use it in your project.


## Usage Example

Fastpress uses decorators and Zod schemas to keep your code clean and validated:

```typescript
import { z } from 'zod';
import { Controller, Get, Post, Body, Query, User, UseMiddleware, Auth, Sanitizer, ServerResponse, ParseIntPipe, ZodValidationPipe } from '@cristianrg/fastpress';

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

export default UserController;
```

## Installation and Setup

Follow these steps to get your environment ready:

### 1) Initialize a New Project

Create your project folder and navigate to it:

```bash
mkdir fastpress-app
cd fastpress-app
```

Initialize your Node.js project:

```bash
pnpm init
```

or if you're using npm:

```bash
npm init -y
```

### 2) Install Dependencies

Fastpress requires **TypeScript** to work properly. Install the framework along with required dependencies:

```bash
pnpm add @cristianrg/fastpress @prisma/client
pnpm add -D prisma typescript @types/node
```

or using npm:

```bash
npm i @cristianrg/fastpress @prisma/client
npm i -D prisma typescript @types/node
```

> **Important:** Fastpress is a TypeScript-first framework. Your controllers must be written in TypeScript (`.ts` files) due to the use of decorators and other TypeScript features.

**Optional - For development with auto-reload:**

```bash
pnpm add -D nodemon
```

or using npm:

```bash
npm i -D nodemon
```

### 3) TypeScript Configuration

Create a `tsconfig.json` file in your project root with the following minimum configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

> **Note:** The `experimentalDecorators` and `emitDecoratorMetadata` options are **required** for the framework to work correctly.

### 4) Package.json Scripts

Add the following to your `package.json`:

```json
{
  "name": "my-fastpress-app",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --watch src --ext ts --exec \"npm run build && npm start\""
  },
  "dependencies": {
    "@cristianrg/fastpress": "^1.1.1",
    "@prisma/client": ">=5.0.0"
  },
  "devDependencies": {
    "@types/node": "^25.3.3",
    "prisma": ">=5.0.0",
    "typescript": "^5.9.3",
    "nodemon": "^3.1.11"
  }
}
```

**Script descriptions:**
- `build`: Compiles TypeScript to JavaScript
- `start`: Runs the compiled application
- `dev`: Watches for changes and automatically rebuilds (requires nodemon)

> **Important:** The `"type": "module"` field is required for ESM support.

### 5) Prisma Configuration

Before you begin, you need to initialize Prisma and configure a few settings.

#### Initialize Prisma

Run the following command to set up Prisma in your project:

```bash
pnpx prisma init
```

or using npm:

```bash
npx prisma init
```

This will create a `prisma` folder containing your schema file and a `prisma.config.ts` file. If you don't have a `.env` file yet, one will be created with a `DATABASE_URL` variable pointing to your database connection.

#### Configure the Prisma Client Generator

Next, you need to configure the generator in your schema to use `prisma-client-js` and remove the `output` line. This ensures that generated files are not saved in your source code folder.

Your generator configuration should look like this:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // Set your database provider (e.g., "postgresql", "mysql", "sqlite", etc.)
}
```

#### Select Your Database Provider

Choose your database provider in the `datasource db` block. By default, Prisma sets it to `postgresql`, but you can change it to any provider supported by Prisma (e.g., `mysql`, `sqlite`, `sqlserver`, `mongodb`, etc.).

#### Configure Database Connection

Make sure the `DATABASE_URL` variable is defined in your `.env` file with the correct connection string for your database.

For example (SQLite):

```bash
DATABASE_URL="file:./dev.db" # This URL is for SQLite providers
```

#### Define Required Models

The framework requires certain models to function properly. Make sure to include them in your `prisma/schema.prisma` file. You can extend the schema and customize these models to fit your needs, but you must maintain the default properties:

```prisma
model User {
  id    String  @id @default(uuid())
  name  String
  email String  @unique
  password String

  sessions Session[]
}

model Session {
  id        String  @id @default(uuid())
  userId    String
  token     String   @unique
  createdAt DateTime @default(now())
  expiresAt DateTime

  user User @relation(fields: [userId], references: [id])
}
```

#### Install Database Adapter

Install the specific adapter for your chosen database provider. For more details, refer to the official Prisma [documentation](https://www.prisma.io/docs/orm/core-concepts/supported-databases/database-drivers).

#### Configure Fastpress

Create a `fastpress.config.ts` file in the project root and configure the database adapter and other options:

```typescript
import { defineFastPressConfig } from '@cristianrg/fastpress';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

export default defineFastPressConfig({
    server: {
        port: 3000,
        env: process.env.NODE_ENV || 'development',
        controllersPath: process.env.NODE_ENV === 'production' ? 'dist' : 'src',
        prismaAdapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' }),
        allowedOrigins: ['http://localhost:3000']
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        algorithm: 'HS256',
        jwt_exp: 15 * 60 * 1000, // 15 minutes
        refresh_exp: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
});
```

**Configuration Options:**

- `server.port`: Port where the server will run (default: 3000)
- `server.env`: Environment mode (default: 'development')
- `server.controllersPath`: Directory where controllers are located. Use `'src'` for development (TypeScript files) and `'dist'` for production (compiled JavaScript files). Controllers must be inside a `modules/` folder within this path. Default: `'src'`
- `server.prismaAdapter`: Prisma database adapter (required)
- `server.allowedOrigins`: CORS allowed origins
- `server.logger`: Custom logger instance (optional)
- `jwt.secret`: JWT secret key
- `jwt.algorithm`: JWT algorithm ('HS256' or 'RS256')
- `jwt.jwt_exp`: Access token expiration in milliseconds
- `jwt.refresh_exp`: Refresh token expiration in milliseconds

> **Important:** Controllers must be placed inside a `modules/` folder within your `controllersPath`. For example: `src/modules/users/user.controller.ts` or `dist/modules/users/user.controller.js`

#### Synchronize Database and Generate Types

Finally, synchronize your Prisma schema with your database and generate the types you'll use in your application. Run the following commands to complete the Prisma setup:

```bash
pnpx prisma db push
pnpx prisma generate
```

or using npm:

```bash
npx prisma db push
npx prisma generate
```

Your Fastpress project is now ready to use! You can start creating controllers and building your backend application.

### 6) Project Structure

Your project structure should look like this:

```
my-fastpress-app/
├── src/
│   ├── modules/
│   │   └── users/
│   │       └── user.controller.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
├── fastpress.config.ts
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

Create your main entry file `src/index.ts`:

```typescript
import { createServer } from '@cristianrg/fastpress';

await createServer();
```

Then create your first controller in `src/modules/users/user.controller.ts`:

```typescript
import { Controller, Get, ServerResponse } from '@cristianrg/fastpress';

@Controller("/users")
class UserController {
    @Get("/")
    getAll() {
        return new ServerResponse(200, "Users list", { users: [] });
    }
}

export default UserController;
```

### 7) Running Your Application

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

### 8) Using Built-in Authentication (Optional)

Fastpress includes a ready-to-use authentication module with JWT support. To use it, you need to explicitly import and register it in your application:

```typescript
import { createServer, AuthController } from '@cristianrg/fastpress';

// The AuthController will be automatically discovered if placed in your modules folder,
// or you can import it directly from the package
await createServer({
    controllers: [AuthController], // Explicitly register if not using file-based discovery
});
```

The `AuthController` provides the following endpoints:
- `POST /auth/login` - User login with email and password
- `POST /auth/signup` - User registration
- `GET /auth/refresh` - Refresh access token using refresh token

You can also use the `AuthService` and auth schemas:

```typescript
import { AuthService, AuthController } from '@cristianrg/fastpress';
```

**Note:** Controllers placed in `src/modules/` (or `dist/modules/` in production) with the pattern `*.controller.ts` are automatically discovered and registered. The framework searches recursively inside the `modules/` folder, so you can organize your controllers in subdirectories (e.g., `src/modules/users/user.controller.ts`, `src/modules/auth/auth.controller.ts`). You don't need to manually register them unless you want to use controllers from the framework package (like `AuthController`).

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