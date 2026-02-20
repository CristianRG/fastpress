import "reflect-metadata";
import { PARAM_METADATA_KEY, ParamMetadata } from "./Param";

/**
 * User decorator to inject the authenticated user object into the route handler's parameters. This is useful when you have authentication middleware that attaches the user object to the request and you want to access it directly in your route handlers.
 * @returns 
 */
export function User(): ParameterDecorator {
    return (target, methodName, parameterIndex) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target, methodName!) || [];
        
        existingParams.push({
            index: parameterIndex,
            type: "user",
            pipes: []
        });
        
        Reflect.defineMetadata(PARAM_METADATA_KEY, existingParams, target, methodName!);
    };
}
