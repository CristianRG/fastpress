import { Delete, Get, Post, Put } from "@/core/decorators/Methods";
import { PrismaModels, Service } from "./Service";
import { Body } from "@/common/decorators/Body";
import { Query } from "@/common/decorators/Query";
import { ServerResponse } from "@/shared/models/ServerResponse";
import { ParseIntPipe } from "@/common/pipes/ParseIntPipe";
import { UseMiddleware } from "@/core/decorators/UseMiddleware";
import { Auth } from "@/shared/middlewares/Auth";

@UseMiddleware(Auth)
/**
 * BaseController is a generic controller class that provides basic CRUD operations for any Prisma model. It uses the Service class to interact with the database and defines route handlers for getting all items, getting an item by ID, creating a new item, updating an existing item, and deleting an item. The routes are decorated with the appropriate HTTP method decorators (Get, Post, Put, Delete) and use parameter decorators (Query, Body) to extract data from the request. The controller also returns standardized ServerResponse objects for consistent API responses.
 */
export class BaseController<T extends keyof PrismaModels, S extends Service<T> = Service<T>> {
    protected service: S;
    protected modelName: T;

    constructor(modelName: T, service?: S) {
        this.modelName = modelName;
        this.service = service || new Service<T>(modelName) as S;
    }

    @Get("/")
    async get(
        @Query("skip", ParseIntPipe) skip: number,
        @Query("take", ParseIntPipe) take: number,
    ) {
        const items = await this.service.findAll({
            skip,
            take
        });

        return new ServerResponse(200, `Found ${items.length} items in ${String(this.service.getModelName())} table`, items);
    }

    @Get("/:id")
    async getById(
        @Query("id", ParseIntPipe) id: number
    ) {
        const item = await this.service.findById(id);

        if (!item) {
            return new ServerResponse(404, "Item not found");
        }

        return new ServerResponse(200, `Item retrieved successfully from ${String(this.service.getModelName())} table`, item);
    }

    @Post("/")
    async create(
        @Body(undefined) data: any
    ) {
        if (!data) return new ServerResponse(400, `Item data is required to create a new ${String(this.service.getModelName())}`);

        const createdItem = await this.service.create(data);
        return new ServerResponse(201, `Item created successfully in ${String(this.service.getModelName())} table`, createdItem);
    }

    @Put("/:id")
    async update(
        @Query("id", ParseIntPipe) id: number,
        @Body(undefined) data: any
    ) {
        if (!data) return new ServerResponse(400, `Item data is required to update a ${String(this.service.getModelName())}`);

        const updatedItem = await this.service.update({ id }, data);
        return new ServerResponse(200, `Item updated successfully in ${String(this.service.getModelName())} table`, updatedItem);
    }

    @Delete("/:id")
    async delete(
        @Query("id", ParseIntPipe) id: number
    ) {
        const item = await this.service.findById(id);
        if (!item) return new ServerResponse(404, "Item not found");

        await this.service.delete({ id });
        return new ServerResponse(200, `Item deleted successfully from ${String(this.service.getModelName())} table`);
    }
}