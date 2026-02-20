import { Context } from "./Context";

/**
 * Abstract class representing a middleware component.
 */
export abstract class Middleware {
    /**
     * 
     * @param ctx `Context` object containing the request, response, and next function.
     * @returns Can return void or a Promise that resolves to void.
     */
    abstract handle(ctx: Context): void | Promise<void>;
}
/**
 * Type representing either a middleware class (constructor) or an instance of a middleware.
 */
type MiddlewareType = typeof Middleware | InstanceType<typeof Middleware>;

export { MiddlewareType };