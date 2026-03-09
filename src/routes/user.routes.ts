import { FastifyInstance } from "fastify";
import { IUserController } from "../types/user";

async function userRoutes(app: FastifyInstance, controller: IUserController) {

    app.get("/saldo/:userId", async (req, reply) => {
        return await controller.getSaldo(req, reply);
    });
}

export default userRoutes;