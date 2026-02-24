import { NextFunction, Request, Response, Router } from "express";
import "reflect-metadata";
import { RouteDefinition, CONTROLLER_ROUTES } from "./Methods";
import { ServerResponse } from "@/shared/models/ServerResponse";
import { Context } from "@/shared/models/Context";
import { Guard } from "@/shared/models/Guard";
import { ParamMetadata, PARAM_METADATA_KEY } from "@/common/decorators/Param";
import { Pipe } from "@/common/pipes/Pipe";
import logger from "@/shared/repository/Logger";
import { Hook } from "@/shared/models/Hook";

/**
 * Get all route definitions for a controller class and its parent classes
 */
function getAllRoutes(constructor: Function): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    const currentRoutes = CONTROLLER_ROUTES.get(constructor) || [];
    routes.push(...currentRoutes);

    // Get routes from parent classes
    let baseProto = Object.getPrototypeOf(constructor.prototype);
    while (baseProto && baseProto.constructor !== Object) {
        const baseConstructor = baseProto.constructor;
        const baseRoutes = CONTROLLER_ROUTES.get(baseConstructor) || [];

        for (const baseRoute of baseRoutes) {
            const routeExists = routes.some(r =>
                r.path === baseRoute.path &&
                r.method === baseRoute.method
            );

            if (!routeExists) {
                routes.push(baseRoute);
            }
        }

        // Move up the prototype chain
        baseProto = Object.getPrototypeOf(baseProto);
    }
    return routes;
}

const paramTypeStrategy = {
    "param": (ctx: Context, propertyKey?: string) => propertyKey ? ctx.params[propertyKey] : ctx.params,
    "query": (ctx: Context, propertyKey?: string) => propertyKey ? ctx.query[propertyKey] : ctx.query,
    "body": (ctx: Context, propertyKey?: string) => propertyKey ? ctx.body[propertyKey] : ctx.body,
    "user": (ctx: Context) => ctx.user,
    "request": (ctx: Context) => ctx.req,
    "response": (ctx: Context) => ctx.res
}

async function handleParams(ctx: Context, paramMetadata: ParamMetadata[]): Promise<any[]> {
    const args: any[] = new Array(paramMetadata.length);

    if (paramMetadata.length == 0) {
        return [ctx];
    }

    for (const param of paramMetadata) {
        let value: any;

        const extractor = paramTypeStrategy[param.type];
        if (!extractor) {
            throw new Error(`Unsupported parameter type: ${param.type}`);
        }
        value = extractor(ctx, param.propertyKey);

        if (param.pipes && param.pipes.length > 0) {
            if (value === undefined && param.isOptional) {
                args[param.index] = undefined;
                continue;
            }

            for (const PipeClass of param.pipes) {
                const pipeInstance = (typeof PipeClass === "function" ? new (PipeClass as any)() : PipeClass) as Pipe;
                value = await pipeInstance.transform(value, ctx);
            }
        }

        args[param.index] = value;
    }

    return args;
}

/**
 * Controller decorator to define a controller class and its route prefix. It also sets up the router for the controller based on the defined routes and their handlers.
 * @param prefix The prefix to be added to all routes defined in this controller. For example, if you set the prefix to "/users" and you have a method decorated with `@Get("/")`, the full path for that route will be "/users/".
 * @returns 
 */
export function Controller(prefix: string): ClassDecorator {
    return (target: any) => {
        const router = Router();

        // Get routes for this controller class and all parent classes
        const routes = getAllRoutes(target);
        const instance = new target();

        for (const route of routes) {

            const guards = Reflect.getMetadata("custom:guards", target.prototype, route.handlerName) || [];
            const guardInstances = guards.map((guard: any) => (typeof guard === "function" ? new (guard as any)() : guard) as Guard) as Guard[];
            const hooks = Reflect.getMetadata("custom:hooks", target.prototype, route.handlerName) || [];
            const hookInstances = hooks.map((hook: any) => (typeof hook === "function" ? new (hook as any)() : hook) as Hook) as Hook[];
            const paramMetadata: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target.prototype, route.handlerName) || [];

            const handler = async (req: Request, res: Response, next: NextFunction) => {
                const ctx = new Context(req, res, next);
                const timestamp = Date.now();

                try {
                    const handlerFunction = instance[route.handlerName];
                    if (typeof handlerFunction !== 'function') {
                        return next(new Error(`Route handler '${route.handlerName}' not found in ${target.name}`));
                    }

                    logger.info(`${req.method.toUpperCase()} ${req.originalUrl}`)

                    for (const guard of guardInstances) {
                        const canActivateResult = await guard.canActivate(ctx);
                        if (canActivateResult instanceof Object && !canActivateResult.allowed) {
                            return res.status(canActivateResult.statusCode || 403).json(new ServerResponse(canActivateResult.statusCode || 403, canActivateResult.message || "Forbidden"));
                        } else if (!canActivateResult) {
                            return res.status(403).json(new ServerResponse(403, "Forbidden"));
                        }
                    }

                    const args = await handleParams(ctx, paramMetadata);

                    for (const hook of hookInstances) {
                        const earlyResult = await hook.before(ctx);
                        if (earlyResult instanceof ServerResponse) {
                            return res.status(earlyResult.statusCode).json(earlyResult);
                        }
                    }

                    const result = await handlerFunction.call(instance, ...args);
                    let finalResult = result;
                    for (const hook of hookInstances) {
                        const hookResult = await hook.after(ctx, finalResult);
                        if (hookResult instanceof ServerResponse) {
                            finalResult = hookResult;
                        }
                    }

                    if (finalResult instanceof ServerResponse) {
                        res.status(finalResult.statusCode).json(finalResult);
                    } else if (finalResult !== undefined) {
                        res.json(finalResult);
                    }

                } catch (error) {
                    if (error instanceof ServerResponse) {
                        logger.error(`Error in ${target.name}.${route.handlerName}: ${error.message}`);
                        return res.status(error.statusCode).json(error);
                    }
                    next(error);
                } finally {
                    const elapsed = Date.now() - timestamp;
                    logger.info(`${req.method.toUpperCase()} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`);
                }
            }
            (router as any)[route.method](route.path, handler);
        }

        Reflect.defineMetadata("router", router, target);
        Reflect.defineMetadata("prefix", prefix, target);
    };
}