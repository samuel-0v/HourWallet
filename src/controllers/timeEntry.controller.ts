import { FastifyReply, FastifyRequest } from "fastify";
import { ITimeEntryController, ITimeEntryService, TimeEntryCreate } from "../types/timeEntry";
import { timeEntryCreateSchema, timeEntryQuerySchema,timeEntryUpdateSchema } from "../schemas/timeEntrt.schema";

export class TimeEntryController implements ITimeEntryController {
    private service: ITimeEntryService;

    constructor(service: ITimeEntryService) {
        this.service = service;
    }

    async addTimeEntry(req: FastifyRequest, reply: FastifyReply) {
        const body = timeEntryCreateSchema.parse(req.body);

        const out = await this.service.addTimeEntry(body);
        reply.code(201).send(out);
        return out;
    }

    async listTimeEntries(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            reply.code(400).send({ message: "Invalid userId" });
            return [];
        }
        const out = await this.service.listTimeEntries(userId);
        reply.send(out);
        return out;
    }

    async getTimeEntry(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        const id = Number(req.params.userId);
        if (isNaN(id)) {
            reply.code(400).send({ message: "Invalid userId" });
            return null;
        }
        const out = await this.service.getTimeEntry(id);
        if (!out) {
            reply.code(404).send({ message: "Not found" });
            return null;
        }
        reply.send(out);
        return out;
    }
}
