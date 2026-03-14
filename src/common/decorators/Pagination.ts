import { PARAM_METADATA_KEY, ParamMetadata } from "./Param";

export function Pagination(): ParameterDecorator {
    return (target, methodName, parameterIndex) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target, methodName!) || [];

        existingParams.push({
            index: parameterIndex,
            type: "pagination",
            pipes: []
        });

        Reflect.defineMetadata(PARAM_METADATA_KEY, existingParams, target, methodName!);
    }
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    [key: string]: any;
}