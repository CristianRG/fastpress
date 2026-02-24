import { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

interface ContextOptions {
    query?: any;
    params?: any;
    body?: any;
}

/**
 * A class representing the context of an Express request, encapsulating the request, response, and next function.
 * It also provides typed access to query parameters, route parameters, and the request body.
 */
export class Context<T extends ContextOptions = ContextOptions> {
    public readonly req: Request;
    public readonly res: Response;
    public readonly next: NextFunction;

    public query: T['query'];
    public params: T['params'];
    public body: T['body'];
    public user?: Omit<User, 'password'>;

    constructor(req: Request, res: Response, next: NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;
        
        this.query = req.query as T['query'];
        this.params = req.params as T['params'];
        this.body = req.body as T['body'];
        this.user = (req as any).user as Omit<User, 'password'> | undefined; // Assuming authentication middleware attaches user to req
    }
}