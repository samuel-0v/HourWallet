import { FastifyInstance } from "fastify";
import { IAuthController } from "../types/user";

async function authRoutes(app: FastifyInstance, controller: IAuthController) {
    // Rotas públicas
    app.post("/register", async (req, reply) => {
        return await controller.register(req, reply);
    });

    app.post("/login", async (req, reply) => {
        return await controller.login(req, reply);
    });

    app.post("/refresh", async (req, reply) => {
        return await controller.refresh(req, reply);
    });
}

export default authRoutes;