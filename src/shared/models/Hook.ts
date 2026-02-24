import { Context } from "./Context";
import { ServerResponse } from "./ServerResponse";

/**
 * Base class for hooks that can be used with the `@UseHooks` decorator. Hooks allow you to run custom logic before and after a route handler is executed.
 * They can be used for tasks like logging, modifying the request/response, or implementing custom behavior that should run around the execution of a route handler.
 */
abstract class Hook {
    abstract name: string;
    abstract description?: string | undefined;
    /**
     * Method that will be executed before the route handler. It receives the `Context` object, which contains information about the request, response, and other relevant data.
     * If this method returns a `ServerResponse`, the execution of the route handler will be skipped and the returned response will be sent to the client immediately.
     * @param ctx The context object containing request, response, and other relevant data.
     */
    abstract before(ctx: Context): Promise<ServerResponse> | ServerResponse | void;
    /**
     * Method that will be executed after the route handler. It receives the `Context` object and the result returned by the route handler (if any).
     * If this method returns a `ServerResponse`, it will override the response that would be sent to the client, allowing you to modify the response based on the result of the route handler or other factors.
     * IMPORTANT: The next hook's `after` method will receive the modified response as the `result` parameter, so you can chain multiple hooks that modify the response in sequence but be aware that the order of execution is the same as the order of declaration in the `@UseHooks` decorator.
     * @param ctx The context object containing request, response, and other relevant data.
     * @param result The result returned by the route handler, if any. This can be used to modify the response before it is sent to the client.
     */
    abstract after<T = any>(ctx: Context, result?: T): Promise<ServerResponse> | ServerResponse | void;
}

export { Hook };