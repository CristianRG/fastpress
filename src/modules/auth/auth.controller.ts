import { Body } from "@/common/decorators/Body";
import { Req } from "@/common/decorators/Req";
import { ZodValidationPipe } from "@/common/pipes/ZodValidationPipe";
import { Controller } from "@/core/decorators/Controller";
import { Get, Post } from "@/core/decorators/Methods";
import { LoginUserSchema, LoginUserType, SignupUserSchema, SignupUserType } from "./auth.zod.schemas";
import { AuthService } from "./auth.service";
import { ServerResponse } from "@/shared/models/ServerResponse";
import logger from "@/shared/repository/Logger";
import { Request } from "express";
import conf from "@/conf";

@Controller("/auth")
class AuthController {

    @Post("/login")
    async login(
        @Body(undefined, new ZodValidationPipe(LoginUserSchema)) body: LoginUserType,
        @Req() req: Request
    ) {
        const { email, password } = body;
        const sessionId = req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('session='))?.split('=')[1] || undefined;
        
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

            return new ServerResponse(200, "Login successful", { user });
        } catch (error) {
            logger.error(`Login error for email ${email}: ${error instanceof Error ? error.message : String(error)}`);
            return new ServerResponse(401, "Invalid email or password");
        }
    }

    @Post("/signup")
    async signup(
        @Body(undefined, new ZodValidationPipe(SignupUserSchema)) body: SignupUserType,
        @Req() req: Request
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

            return new ServerResponse(201, "Signup successful", { user });
        } catch (error) {
            logger.error(`Signup error for email ${email}: ${error instanceof Error ? error.message : String(error)}`);
            return new ServerResponse(400, error instanceof Error ? error.message : "Signup failed");
        }
    }

    @Get("/refresh")
    async refresh(
        @Req() req: Request
    ) {
        try {
            const refreshToken = req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('rjwt='))?.split('=')[1];

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

            return new ServerResponse(200, "Token refreshed", { user });
        } catch (error) {
            logger.error(`Refresh error: ${error instanceof Error ? error.message : String(error)}`);
            return new ServerResponse(401, "Invalid refresh token");
        }
    }
}

export default AuthController;