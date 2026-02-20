import { ServerResponse } from "@/shared/models/ServerResponse";
import "reflect-metadata";

// Use a Map to store routes for each controller class
// The key is the controller's constructor function and the value is an array of routes
export const CONTROLLER_ROUTES = new Map<Function, RouteDefinition[]>();

export interface RouteDefinition {
    method: "get" | "post" | "put" | "delete";
    path: string;
    handlerName: string;
}

// Generic type for a method decorator that validates ServerResponse return type
// T extends a function that returns ServerResponse or Promise<ServerResponse>
type RouteMethodDecorator<T extends (...args: any[]) => ServerResponse | Promise<ServerResponse>> = (
    target: any, 
    propertyKey: string | symbol, 
    descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

// Factory function that takes a path and returns a decorator
type RouteDecoratorFactory = <T extends (...args: any[]) => ServerResponse | Promise<ServerResponse>>(
    path: string
) => RouteMethodDecorator<T>;

function createMethodDecorator(method: RouteDefinition["method"]): RouteDecoratorFactory {
    return <T extends (...args: any[]) => ServerResponse | Promise<ServerResponse>>(path: string) => {
        return (
            target: any, 
            propertyKey: string | symbol, 
            descriptor: TypedPropertyDescriptor<T>
        ) => {
            // Get the actual class constructor
            // If target is a prototype, target.constructor is the class constructor
            // Otherwise, it's a static method and target is the constructor itself
            const constructor = typeof target === 'function' ? target : target.constructor;
            
            // Get existing routes for this controller class or initialize a new array
            const routes = CONTROLLER_ROUTES.get(constructor) || [];
            
            // Check if this route already exists to avoid duplicates
            const routeExists = routes.some(r => 
                r.path === path && 
                r.method === method &&
                r.handlerName === propertyKey
            );
            
            if (!routeExists) {
                // Add the new route
                routes.push({
                    path,
                    method,
                    handlerName: propertyKey as string
                });
                
                // Store the updated routes back in the map
                CONTROLLER_ROUTES.set(constructor, routes);
            }
        };
    }
}

/**
 * Get decorator. Adds a GET route to the controller.
 * @param path The route path.
 * @returns `ServerResponse` or `Promise<ServerResponse>` from the decorated method.
 */
export const Get = createMethodDecorator("get");
/**
 * Post decorator. Adds a POST route to the controller.
 * @param path The route path.
 * @returns `ServerResponse` or `Promise<ServerResponse>` from the decorated method.
 */
export const Post = createMethodDecorator("post");
/**
 * Put decorator. Adds a PUT route to the controller.
 * @param path The route path.
 * @returns `ServerResponse` or `Promise<ServerResponse>` from the decorated method.
 */
export const Put = createMethodDecorator("put");
/**
 * Delete decorator. Adds a DELETE route to the controller.
 * @param path The route path.
 * @returns `ServerResponse` or `Promise<ServerResponse>` from the decorated method.
 */
export const Delete = createMethodDecorator("delete");