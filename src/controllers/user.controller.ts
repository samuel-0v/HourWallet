import { FastifyReply, FastifyRequest } from "fastify";
import { IUserController, IUserService } from "../types/user";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

export class UserController implements IUserController {
    private service: IUserService;

    constructor(service: IUserService) {
        this.service = service;
    }

    async getSaldo(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            reply.code(400).send({ message: "Invalid userId" });
            return { totalHours: 0, totalAmount: 0 };
        }
        const res = await this.service.getSaldo(userId);
        reply.send(res);
        return res;
    }
}
