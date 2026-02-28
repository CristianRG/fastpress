import { Body } from "@/common/decorators/Body";
import { Req } from "@/common/decorators/Req";
import { ZodValidationPipe } from "@/common/pipes/ZodValidationPipe";
import { Controller } from "@/core/decorators/Controller";
import { Get, Post } from "@/core/decorators/Methods";
import { AuthService } from "./auth.service";
import { ServerResponse } from "@/shared/models/ServerResponse";
import logger from "@/shared/repository/Logger";
import conf from "@/conf";

import z from "zod";

const LoginUserSchema = z.object({
    email: z.string({ error: (iss) => iss.input === undefined ? "Email is required" : iss.message }).email(),
    password: z.string({ error: (iss) => iss.input === undefined ? "Password is required" : iss.message }).min(6)
});

const SignupUserSchema = z.object({
    email: z.string({ error: (iss) => iss.input === undefined ? "Email is required" : iss.message }).email(),
    password: z.string({ error: (iss) => iss.input === undefined ? "Password is required" : iss.message }).min(6),
    name: z.string({ error: (iss) => iss.input === undefined ? "Name is required" : iss.message }).min(2)
});

type LoginUserType = z.infer<typeof LoginUserSchema>;
type SignupUserType = z.infer<typeof SignupUserSchema>;

@Controller("/auth")
class AuthController {

    @Post("/login")
    async login(
        @Body(undefined, new ZodValidationPipe(LoginUserSchema)) body: LoginUserType,
        @Req() req: any
    ) {
        const { email, password } = body;
        const sessionId = req.headers.cookie?.split(';').find((cookie:any) => cookie.trim().startsWith('session='))?.split('=')[1] || undefined;
        
        try {
            const user = await AuthService.login(email, password);
            const { jwt } = await AuthService.generateAccessToken(user.id);
            const { rjwt } = await AuthService.generateRefreshToken(user.id, sessionId);

            req.res?.cookie("jwt", jwt.token, {
                httpOnly: true,
                secure: conf.ENV === "production",
                sameSite: "strict",
                maxAge: jwt.expiresIn
            });

            req.res?.cookie("rjwt", rjwt.token, {
                httpOnly: true,
                secure: conf.ENV === "production",
                sameSite: "strict",
                maxAge: rjwt.expiresIn
            });

            if (!sessionId) {
                req.res?.cookie("session", rjwt.token, {
                    httpOnly: true,
                    secure: conf.ENV === "production",
                    sameSite: "strict",
                    maxAge: rjwt.expiresIn
                });
            }

            return new ServerResponse(200, "Login successful", { user: { id: user.id, email: user.email, name: user.name } });
        } catch (error) {
            logger.error(`Login error for email ${email}: ${error instanceof Error ? error.message : String(error)}`);
            return new ServerResponse(401, "Invalid email or password");
        }
    }

    @Post("/signup")
    async signup(
        @Body(undefined, new ZodValidationPipe(SignupUserSchema)) body: SignupUserType,
        @Req() req: any
    ) {
        const { email, password, name } = body;

        try {
            const user = await AuthService.signup(email, password, name);
            const { jwt } = await AuthService.generateAccessToken(user.id);
            const { rjwt } = await AuthService.generateRefreshToken(user.id);

            req.res?.cookie("jwt", jwt.token, {
                httpOnly: true,
                secure: conf.ENV === "production",
                sameSite: "strict",
                maxAge: jwt.expiresIn
            });

            req.res?.cookie("rjwt", rjwt.token, {
                httpOnly: true,
                secure: conf.ENV === "production",
                sameSite: "strict",
                maxAge: rjwt.expiresIn
            });

            req.res?.cookie("session", rjwt.token, {
                httpOnly: true,
                secure: conf.ENV === "production",
                sameSite: "strict",
                maxAge: rjwt.expiresIn
            });

            return new ServerResponse(201, "Signup successful", { user: { id: user.id, email: user.email, name: user.name } });
        } catch (error) {
            logger.error(`Signup error for email ${email}: ${error instanceof Error ? error.message : String(error)}`);
            return new ServerResponse(400, error instanceof Error ? error.message : "Signup failed");
        }
    }

    @Get("/refresh")
    async refresh(
        @Req() req: any
    ) {
        try {
            const refreshToken = req.headers.cookie?.split(';').find((cookie:any) => cookie.trim().startsWith('rjwt='))?.split('=')[1];

            if (!refreshToken) {
                return new ServerResponse(401, "No refresh token provided");
            }

            const user = await AuthService.validateRefreshToken(refreshToken);
            if (!user) {
                return new ServerResponse(401, "Invalid refresh token");
            }

            const { jwt } = await AuthService.generateAccessToken(user.id);

            req.res?.cookie("jwt", jwt.token, {
                httpOnly: true,
                secure: conf.ENV === "production",
                sameSite: "strict",
                maxAge: jwt.expiresIn
            });

            return new ServerResponse(200, "Token refreshed", { user: { id: user.id, email: user.email, name: user.name } });
        } catch (error) {
            logger.error(`Refresh error: ${error instanceof Error ? error.message : String(error)}`);
            return new ServerResponse(401, "Invalid refresh token");
        }
    }
}

export default AuthController;