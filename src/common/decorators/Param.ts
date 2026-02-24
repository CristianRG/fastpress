import "reflect-metadata";
import { Pipe } from "../pipes/Pipe";

const PARAM_METADATA_KEY = "custom:params";
type ParamType = "param" | "query" | "body" | "user" | "request" | "response";
export type PipeType = Pipe | (new (...args: any[]) => Pipe);

export interface ParamMetadata {
    index: number;
    type: ParamType;
    propertyKey?: string;
    isOptional?: boolean;
    pipes?: PipeType[];
}

/**
 * Param decorator to extract data from the route parameters and inject it into the route handler's parameters. You can also apply pipes to transform or validate the data before it is passed to the route handler.
 * @param propertyKey propertyKey is optional. If provided, it will extract the specific property from the route parameters (e.g., if you want to extract req.params.id, you would use @Param("id")). If not provided, it will inject the entire route parameters object into the parameter.
 * @param isOptional is optional. If set to true, it indicates that the parameter is optional. If the parameter is not present in the route parameters, it will be set to undefined instead of throwing an error.
 * @param pipes An array of Pipe instances or Pipe classes to be applied to the extracted data. Pipes are functions that can transform or validate the data before it is passed to the route handler. The pipes will be executed in the order they are provided in the array.
 * @returns 
 */
export function Param(propertyKey?: string, isOptional: boolean = false, ...pipes: PipeType[]): ParameterDecorator {
    return (target, methodName, parameterIndex) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target, methodName!) || [];
        
        existingParams.push({
            index: parameterIndex,
            type: "param",
            propertyKey,
            isOptional,
            pipes
        });
        
        Reflect.defineMetadata(PARAM_METADATA_KEY, existingParams, target, methodName!);
    };
}

export { PARAM_METADATA_KEY };