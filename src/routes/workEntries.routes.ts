import { FastifyInstance } from "fastify";
import { IWorkEntriesController } from "../types/workEntries";

async function WorkEntriesRoutes(app: FastifyInstance, controller: IWorkEntriesController) {
    app.post("/", async (req, reply) => {
        return await controller.addWorkEntries(req, reply);
    });

    app.get("/:userId", async (req, reply) => {
        return await controller.listTimeEntries(req, reply);
    });

    app.delete("/:id/:userId", async (req, reply) => {
        return await controller.deleteWorkEntries(req, reply);
    });

    app.get("/entry/:id", async (req, reply) => {
        return await controller.getWorkEntries(req, reply);
    });
}

export default WorkEntriesRoutes;