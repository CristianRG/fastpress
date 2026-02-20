import { Context } from "@/shared/models/Context";

export interface PipeTransform<T = any, R = any> {
    transform(value: T, ctx: Context): R | Promise<R>;
}

export abstract class Pipe<T = any, R = any> implements PipeTransform<T, R> {
    abstract transform(value: T, ctx: Context): R | Promise<R>;
}
