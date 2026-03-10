import { FastifyInstance } from "fastify";
import { IWorkEntriesController } from "../types/workEntries";
import { authMiddleware } from "../middleware/auth.middleware";

async function WorkEntriesRoutes(app: FastifyInstance, controller: IWorkEntriesController) {
    // Todas as rotas de work-entries exigem autenticação
    app.post("/", { preHandler: authMiddleware }, async (req, reply) => {
        return await controller.addWorkEntries(req, reply);
    });

    app.get("/:userId", { preHandler: authMiddleware }, async (req, reply) => {
        return await controller.listTimeEntries(req, reply);
    });

    app.delete("/:id/:userId", { preHandler: authMiddleware }, async (req, reply) => {
        return await controller.deleteWorkEntries(req, reply);
    });

    app.get("/entry/:id", { preHandler: authMiddleware }, async (req, reply) => {
        return await controller.getWorkEntries(req, reply);
    });

    app.put("/", { preHandler: authMiddleware }, async (req, reply) => {
        return await controller.updateWorkEntries(req, reply);
    });
}

export default WorkEntriesRoutes;