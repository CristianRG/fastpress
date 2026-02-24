import "reflect-metadata";
import { Application, Request, Response, NextFunction } from "express";
import { MiddlewareType } from "@/shared/models/Middleware";
import { Context } from "@/shared/models/Context";

export function registerControllers(
    app: Application,
    controllers: any[],
) {
    for (const controller of controllers) {
        const controllerPrefix = Reflect.getMetadata("prefix", controller);
        const router = Reflect.getMetadata("router", controller);
        const middlewares: MiddlewareType[] = Reflect.getMetadata("custom:middlewares", controller) || [];

        if (router) {
            if (middlewares.length > 0) {
                app.use(
                    controllerPrefix,
                    ...middlewares.map(mw => {
                        const middlewareInstance = typeof mw === "function" ? new (mw as any)() : mw;
                        
                        return (req: Request, res: Response, next: NextFunction) => {
                            const ctx = new Context(req, res, next);
                            return middlewareInstance.handle(ctx);
                        };
                    }),
                    router
                );
            } else {
                app.use(controllerPrefix, router);
            }
        }
    }
}