import { FastifyInstance } from "fastify";
import { IUserController } from "../types/user";
import { authMiddleware } from "../middleware/auth.middleware";

async function userRoutes(app: FastifyInstance, controller: IUserController) {
    // Rota protegida — somente usuários autenticados acessam seu saldo
    app.get("/saldo/:userId", { preHandler: authMiddleware }, async (req, reply) => {
        return await controller.getSaldo(req, reply);
    });
}

export default userRoutes;