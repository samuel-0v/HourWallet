import { FastifyReply, FastifyRequest } from "fastify";
import { IWorkEntriesController, IWorkEntriesService, WorkEntriesCreate } from "../types/workEntries";
import { WorkEntriesCreateSchema, WorkEntriesQuerySchema,WorkEntriesUpdateSchema } from "../schemas/workEntries.schema";

export class WorkEntriesController implements IWorkEntriesController {
    private service: IWorkEntriesService;

    constructor(service: IWorkEntriesService) {
        this.service = service;
    }

    async addWorkEntries(req: FastifyRequest, reply: FastifyReply) {
        const body = WorkEntriesCreateSchema.parse(req.body);

        const out = await this.service.addWorkEntries(body);
        reply.code(201).send(out);
        return out;
    }

    async listTimeEntries(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            reply.code(400).send({ message: "Invalid userId" });
            return [];
        }
        const out = await this.service.listWorkEntries(userId);
        reply.send(out);
        return out;
    }

    async getWorkEntries(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            reply.code(400).send({ message: "Invalid id" });
            return null;
        }
        const out = await this.service.getWorkEntries(id);
        if (!out) {
            reply.code(404).send({ message: "Not found" });
            return null;
        }
        reply.send(out);
        return out;
    }

    async deleteWorkEntries(req: FastifyRequest<{ Params: { id: string, userId: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            reply.code(400).send({ message: "Invalid id" });
            return;
        }
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            reply.code(400).send({ message: "Invalid userId" });
            return;
        }
        
        try {
            await this.service.deleteWorkEntries(id, userId);
            reply.code(204).send();
        } catch (e) {
            if (e instanceof Error && e.message === "Time entry not found") {
                reply.code(404).send({ message: e.message });
            } else if (e instanceof Error && e.message === "Unauthorized") {
                reply.code(403).send({ message: e.message });
            } else {
                reply.code(500).send({ message: "Internal server error" });
            }
        }   
    }
}
