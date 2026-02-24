import prisma from "@/common/prisma";
import { compare, encrypt } from "@/common/util";
import conf from "@/conf";
import jwtoken from "jsonwebtoken";

class AuthService {

    static async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }
        return user;
    }

    static async signup(email: string, password: string, name: string) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("Email already in use");
        }

        const encryptedPassword = encrypt(password);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: encryptedPassword,
                name
            }
        });
        return newUser;
    }

    static async generateRefreshToken(userId: string, sessionId?: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }

        const rjwt = jwtoken.sign({ id: user.id }, conf.JWT_SECRET, { algorithm: conf.ALGORITHM, expiresIn: conf.RJWT_EXPIRATION });
        const rjwtObject = {
            token: rjwt,
            expiresIn: conf.RJWT_EXPIRATION
        };

        const existingSession = sessionId ? await prisma.session.findUnique({ where: { id: sessionId } }) : null;

        if (!existingSession) {
            await prisma.session.create({
                data: {
                    token: rjwt,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + conf.RJWT_EXPIRATION)
                }
            });
        } else {
            await prisma.session.update({
                where: { id: existingSession.id },
                data: {
                    token: rjwt,
                    expiresAt: new Date(Date.now() + conf.RJWT_EXPIRATION)
                }
            });
        }

        return { rjwt: rjwtObject };
    }

    static async generateAccessToken(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        const jwt = jwtoken.sign({ id: user.id }, conf.JWT_SECRET, { algorithm: conf.ALGORITHM, expiresIn: conf.JWT_EXPIRATION });
        const jwtObject = {
            token: jwt,
            expiresIn: conf.JWT_EXPIRATION
        };

        return { jwt: jwtObject };
    }

    static async validateRefreshToken(token: string) {
        jwtoken.verify(token, conf.JWT_SECRET, { algorithms: [conf.ALGORITHM] });
        const session = await prisma.session.findUnique({ where: { token }, include: { user: { omit: { password: true } } } });
        if (!session) {
            throw new Error("Session not found");
        }
        
        return session.user;
    }
}

export { AuthService };