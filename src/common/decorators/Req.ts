import "reflect-metadata";
import { PARAM_METADATA_KEY, ParamMetadata } from "./Param";

/**
 * Req decorator to inject the entire request object into the route handler's parameters. This is useful when you need access to the full request object, including headers, body, query parameters, etc.
 * @returns 
 */
export function Req(): ParameterDecorator {
    return (target, methodName, parameterIndex) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target, methodName!) || [];
        
        existingParams.push({
            index: parameterIndex,
            type: "request",
            pipes: []
        });
        
        Reflect.defineMetadata(PARAM_METADATA_KEY, existingParams, target, methodName!);
    };
}

/**
 * Res decorator to inject the entire response object into the route handler's parameters. This is useful when you need access to the full response object to set headers, status codes, send responses, etc.
 * @returns 
 */
export function Res(): ParameterDecorator {
    return (target, methodName, parameterIndex) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target, methodName!) || [];
        
        existingParams.push({
            index: parameterIndex,
            type: "response",
            pipes: []
        });
        
        Reflect.defineMetadata(PARAM_METADATA_KEY, existingParams, target, methodName!);
    };
}
