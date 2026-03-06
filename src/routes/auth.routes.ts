import { FastifyInstance } from "fastify";
import { IAuthController } from "../types/user";

async function authRoutes(app: FastifyInstance, controller: IAuthController) {
    app.post("/register", async (req, reply) => {
        return await controller.register(req, reply);
    });

    app.post("/", async (req, reply) => {
        return await controller.login(req, reply);
    }); 
}

export default authRoutes;