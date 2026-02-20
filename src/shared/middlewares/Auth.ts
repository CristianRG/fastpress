import { Context } from "../models/Context";
import { Middleware } from "../models/Middleware";
import jwt from "jsonwebtoken";
import conf from "@/conf";
import { getRedisClient } from "@/common/redis";
import { ServerResponse } from "../models/ServerResponse";
import prisma from "@/common/prisma";
const { ALGORITHM } = conf;

/**
 * Auth middleware to protect routes that require authentication. It checks for the presence of a JWT token in the cookies, verifies it, and attaches the authenticated user to the request context. If the token is missing, invalid, or expired, it responds with a 401 Unauthorized status.
 */
class Auth extends Middleware {
    async handle(ctx: Context): Promise<void> {
        const accessToken = ctx.req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('jwt='))?.split('=')[1];

        if (!accessToken) {
            ctx.res.status(401).json(new ServerResponse(401, "No token provided"));
            return;
        }
        
        try {
            const decoded = jwt.verify(accessToken, conf.JWT_SECRET, {
                algorithms: [ALGORITHM]
            }) as { id: string };

            const redisClient = await getRedisClient();
            let cachedUser: string | null = null;
            
            if (redisClient) {
                cachedUser = await redisClient.get(`user:${decoded.id}`);
            }

            if (cachedUser) {
                ctx.user = JSON.parse(cachedUser);
                ctx.next();
                return;
            }

            const dbUser = await prisma.user.findUnique({ where: { id: decoded.id }, omit: { password: true } });
            if (!dbUser) throw new Error("User not found");

            if (redisClient) {
                await redisClient.set(`user:${decoded.id}`, JSON.stringify(dbUser), { EX: 3600 });
            }

            ctx.user = dbUser;
            ctx.req.user = dbUser;
            ctx.next();

        } catch (error: any) {
            const message = error.name === 'TokenExpiredError' ? 'Token Expired' : 'Unauthorized';
            ctx.res.status(401).json(new ServerResponse(401, message));
        }
    }
}

export { Auth };