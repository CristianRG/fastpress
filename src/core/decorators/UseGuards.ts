import { GuardType } from "@/shared/models/Guard";

/**
 * Guard decorator to apply guards to a route handler. Guards are functions that can be executed before the route handler is called, allowing you to perform authorization checks, validate user permissions, etc.
 * @param guards An array of Guard instances to be applied to the route handler. The guards will be executed in the order they are provided in the array.
 * @returns 
 */
export function UseGuards(...guards: GuardType[]): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const existingGuards = Reflect.getMetadata("custom:guards", target, propertyKey) || [];
        Reflect.defineMetadata("custom:guards", [...existingGuards, ...guards], target, propertyKey);
    }
}