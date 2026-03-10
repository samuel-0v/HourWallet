import { FastifyReply, FastifyRequest } from "fastify";
import { IAuthController, IAuthService, UserCreate } from "../types/user";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import type { JwtAccessPayload, JwtRefreshPayload } from "../utils/jwt";

export class AuthController implements IAuthController {
    private service: IAuthService;

    constructor(service: IAuthService) {
        this.service = service;
    }

    async register(req: FastifyRequest, reply: FastifyReply) {
        const body: UserCreate = registerSchema.parse(req.body);
        const out = await this.service.register(body);
        reply.code(201).send(out);
    }

    async login(req: FastifyRequest, reply: FastifyReply) {
        const body: { username: string; password: string } = loginSchema.parse(req.body);
        const user = await this.service.login(body.username, body.password);
        const payload: JwtAccessPayload = { sub: user.id, username: user.username, role: user.role };
        const access_token  = await reply.accessJwtSign(payload);
        const refresh_token = await reply.refreshJwtSign(payload);
        reply.send({ user, access_token, refresh_token });
    }

    async refresh(req: FastifyRequest, reply: FastifyReply) {
        try {
            await req.refreshJwtVerify();
            const decoded = req.refresh as JwtRefreshPayload;
            const access_token = await reply.accessJwtSign({
                sub: decoded.sub,
                username: decoded.username,
                role: decoded.role,
            });
            reply.send({ access_token });
        } catch {
            reply.code(401).send({ message: "Refresh token inválido ou expirado" });
        }
    }
}
