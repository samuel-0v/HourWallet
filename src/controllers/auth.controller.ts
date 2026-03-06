import { FastifyReply, FastifyRequest } from "fastify";
import { IAuthController, IAuthService } from "../types/user";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

export class AuthController implements IAuthController {
    private service: IAuthService;

    constructor(service: IAuthService) {
        this.service = service;
    }

    async register(req: FastifyRequest, reply: FastifyReply) {
        const body = registerSchema.parse(req.body);
        const out = await this.service.register(body);
        reply.code(201).send(out);
        return out;
    }

    async login(req: FastifyRequest, reply: FastifyReply) {
        const body = loginSchema.parse(req.body);
        const res = await this.service.login(body.username, body.password);
        reply.send(res);
        return res;
    }
}
