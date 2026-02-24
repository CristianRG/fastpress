import { Hook } from "@/shared/models/Hook";

/**
 * Hook decorator to apply hooks to a route handler. Hooks are functions that can be executed before or after the route handler is called, allowing you to perform additional logic such as logging, modifying the request/response, etc.
 * @param hooks An array of Hook instances to be applied to the route handler. The hooks will be executed in the order they are provided in the array.
 * @returns 
 */
export function UseHooks(...hooks: Hook[]): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const existingHooks = Reflect.getMetadata("custom:hooks", target, propertyKey) || [];
        Reflect.defineMetadata("custom:hooks", [...existingHooks, ...hooks], target, propertyKey);
    }
}