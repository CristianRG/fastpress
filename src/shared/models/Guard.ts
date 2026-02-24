import { Context } from "./Context";

export interface GuardResponse {
    allowed: boolean;
    message?: string;
    statusCode?: number;
}

/**
 * Guard is an abstract class that defines the structure for creating guards in the application. Guards are used to protect routes by determining whether a request is allowed to proceed based on custom logic. The canActivate method must be implemented by any class that extends Guard, and it should return either a boolean or a GuardResponse object indicating whether the request is allowed or not.
 */
export abstract class Guard {
    abstract canActivate(ctx: Context): GuardResponse | boolean | Promise<GuardResponse | boolean>;
}

export type GuardType = typeof Guard | InstanceType<typeof Guard>;