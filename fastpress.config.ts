import { defineFastPressConfig } from "./src/conf/config";
import { config } from "dotenv";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
config();

export default defineFastPressConfig({
    server: {
        prismaAdapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' }),
    },
    jwt: {
        secret: process.env.JWT_SECRET || "your_jwt_secret",
        algorithm: "HS256",
        jwt_exp: 15 * 60 * 1000, // 15 minutes in milliseconds
        refresh_exp: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    }
});