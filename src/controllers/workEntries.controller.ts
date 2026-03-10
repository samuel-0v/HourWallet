import { FastifyReply, FastifyRequest } from "fastify";
import { IWorkEntriesController, IWorkEntriesService, WorkEntriesCreate } from "../types/workEntries";
import { WorkEntriesCreateSchema, WorkEntriesQuerySchema,WorkEntriesUpdateSchema } from "../schemas/workEntries.schema";
import { JwtAccessPayload } from "../utils/jwt";

export class WorkEntriesController implements IWorkEntriesController {
    private service: IWorkEntriesService;

    constructor(service: IWorkEntriesService) {
        this.service = service;
    }

    async addWorkEntries(req: FastifyRequest, reply: FastifyReply) {
        const body: WorkEntriesCreate = WorkEntriesCreateSchema.parse(req.body);
        const out = await this.service.addWorkEntries(body);
        reply.code(201).send(out);
        return out;
    }

    async listTimeEntries(req: FastifyRequest, reply: FastifyReply) {
        const user = req.user as JwtAccessPayload;
        if (!user) {
            reply.code(401).send({ message: "Unauthorized" });
            return [];
        }
        const out = await this.service.listWorkEntries(user.sub);
        reply.send(out);
        return out;
    }

    async getWorkEntries(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const jwtUser = req.user as JwtAccessPayload;
        console.log("JWT User:", jwtUser);
        if (!jwtUser) {
            reply.code(401).send({ message: "Unauthorized" });
            return null;
        }

        const id = Number(req.params.id);
        if (isNaN(id)) {
            reply.code(400).send({ message: "Invalid id" });
            return null;
        }

        const out = await this.service.getWorkEntries(id, jwtUser.sub);
        if (!out) {
            reply.code(404).send({ message: "Not found" });
            return null;
        }
        reply.send(out);
        return out;

    }

    async updateWorkEntries(req: FastifyRequest, reply: FastifyReply) {

        const user = req.user as JwtAccessPayload;
        if (!user) {
            reply.code(401).send({ message: "Unauthorized" });
            return null;
        }

        const body = WorkEntriesUpdateSchema.parse(req.body);

        try {
            const out = await this.service.updateWorkEntries(body, user.sub);
            reply.send(out);
            return out;
        } catch (e) {
            if (e instanceof Error && e.message === "Time entry not found") {
                reply.code(404).send({ message: e.message });
            } else if (e instanceof Error && e.message === "Unauthorized") {
                reply.code(403).send({ message: e.message });
            } else {
                reply.code(500).send({ message: "Internal server error" });
            }
            return null;
        }
    }

    async deleteWorkEntries(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            reply.code(400).send({ message: "Invalid id" });
            return;
        }
        const user = req.user as JwtAccessPayload;
        if (!user) {
            reply.code(401).send({ message: "Unauthorized" });
            return;
        }
        
        try {
            await this.service.deleteWorkEntries(id, user.sub);
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
