import "reflect-metadata";
import { PARAM_METADATA_KEY, ParamMetadata, PipeType } from "./Param";

/**
 * Query decorator to extract data from the query parameters and inject it into the route handler's parameters. You can also apply pipes to transform or validate the data before it is passed to the route handler.
 * @param propertyKey propertyKey is optional. If provided, it will extract the specific property from the query parameters (e.g., if you want to extract req.query.page, you would use @Query("page")). If not provided, it will inject the entire query parameters object into the parameter.
 * @param pipes An array of Pipe instances or Pipe classes to be applied to the extracted data. Pipes are functions that can transform or validate the data before it is passed to the route handler. The pipes will be executed in the order they are provided in the array.
 * @returns 
 */
export function Query(propertyKey?: string, ...pipes: PipeType[]): ParameterDecorator {
    return (target, methodName, parameterIndex) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target, methodName!) || [];
        
        existingParams.push({
            index: parameterIndex,
            type: "query",
            propertyKey,
            pipes
        });
        
        Reflect.defineMetadata(PARAM_METADATA_KEY, existingParams, target, methodName!);
    };
}
