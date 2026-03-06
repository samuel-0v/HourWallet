import { FastifyInstance } from "fastify";
import { ITimeEntryController } from "../types/timeEntry";

async function timeEntryRoutes(app: FastifyInstance, controller: ITimeEntryController) {
    app.post("/", async (req, reply) => {
        return await controller.addTimeEntry(req, reply);
    });

    app.get("/:userId", async (req, reply) => {
        return await controller.listTimeEntries(req, reply);
    });
}

export default timeEntryRoutes;