import conf from "@/conf";
import { PrismaClient } from "@prisma/client";

export interface ServiceOptions {
    skip?: number;
    take?: number;
    cursor?: any;
    orderBy?: any;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page?: number;
    pageSize?: number;
    hasNext?: boolean;
}

export interface PrismaModels extends Omit<PrismaClient, "$connect" | "$disconnect" | "$executeRaw" | "$executeRawUnsafe" | "$queryRaw" | "$queryRawUnsafe" | "$transaction" | "$on" | "$extends"> {}

type PrismaDelegate<T extends keyof PrismaModels> = PrismaModels[T];
type PrismaCreateInput<T extends keyof PrismaModels> =
    PrismaDelegate<T> extends { create: (args: infer A) => any }
    ? A extends { data: infer D }
    ? D
    : never
    : never;
type PrismaUpdateInput<T extends keyof PrismaModels> =
    PrismaDelegate<T> extends { update: (args: infer A) => any }
    ? A extends { data: infer D }
    ? D
    : never
    : never;

/**
 * BaseService is an abstract class that provides common database operations for any Prisma model. It defines methods for finding all records, finding a single record by criteria, finding a record by ID, creating a new record, updating an existing record, deleting a record, paginating results, counting records, and checking for the existence of records. The Service class extends BaseService and provides a concrete implementation that requires specifying the model name. This structure allows for easy creation of services for different models by simply extending the Service class and providing the appropriate model name.
 */
export abstract class BaseService<TModel extends keyof PrismaModels> {
    protected abstract modelName: TModel;
    protected prisma: PrismaClient;

    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || new PrismaClient({ adapter: conf.PRISMA_ADAPTER });
    }

    protected get model() {
        return (this.prisma as any)[this.modelName];
    }

    async findAll(options?: ServiceOptions) {
        return this.model.findMany({
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy,
        });
    }

    async findOne(where: any) {
        return this.model.findFirst({ where });
    }

    async findById(id: string | number) {
        return this.model.findUnique({ where: { id } });
    }

    async create(data: PrismaCreateInput<TModel>) {
        return this.model.create({ data });
    }

    async update(where: any, data: PrismaUpdateInput<TModel>) {
        return this.model.update({ where, data });
    }

    async delete(where: any) {
        return this.model.delete({ where });
    }

    async paginate(
        where: any = {},
        page: number = 1,
        pageSize: number = 10,
        orderBy?: any
    ): Promise<PaginatedResult<any>> {
        const skip = (page - 1) * pageSize;
        
        const [data, total] = await Promise.all([
            this.model.findMany({ where, skip, take: pageSize, orderBy }),
            this.model.count({ where })
        ]);

        return {
            data,
            total,
            page,
            pageSize,
            hasNext: skip + pageSize < total
        };
    }

    async count(where: any = {}) {
        return this.model.count({ where });
    }

    async exists(where: any): Promise<boolean> {
        const count = await this.model.count({ where });
        return count > 0;
    }
}

export class Service<TModel extends keyof PrismaModels> extends BaseService<TModel> {
    protected modelName: TModel;

    constructor(modelName: TModel, prisma?: PrismaClient) {
        super(prisma);
        this.modelName = modelName;
    }

    getModelName(): TModel {
        return this.modelName;
    }
}