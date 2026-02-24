import { MiddlewareType } from "@/shared/models/Middleware";

/**
 * Middleware decorator to apply middlewares to a controller class. Middlewares are functions that can be executed before the route handlers of the controller are called, allowing you to perform tasks such as authentication, logging, etc.
 * @param middlewares An array of Middleware instances to be applied to the controller class. The middlewares will be executed in the order they are provided in the array.
 * @returns 
 */
export function UseMiddleware(...middlewares: MiddlewareType[]): ClassDecorator {
    return (target: any) => {
        const existingMiddlewares = Reflect.getMetadata("custom:middlewares", target) || [];
        Reflect.defineMetadata("custom:middlewares", [...existingMiddlewares, ...middlewares], target);
    }
}