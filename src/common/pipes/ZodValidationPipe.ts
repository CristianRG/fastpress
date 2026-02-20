import { Pipe } from "./Pipe";
import { Context } from "@/shared/models/Context";
import { ServerResponse } from "@/shared/models/ServerResponse";
import { z, ZodSchema } from "zod";

export class ZodValidationPipe<T extends ZodSchema> extends Pipe {
    constructor(private schema: T) {
        super();
    }

    transform(value: any, ctx: Context): z.infer<T> {
        try {
            return this.schema.parse(value);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ServerResponse(400, "Validation failed", {
                    errors: error.issues.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            throw error;
        }
    }
}