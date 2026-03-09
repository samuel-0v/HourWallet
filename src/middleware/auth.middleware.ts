import { FastifyRequest, FastifyReply } from "fastify";
import type { JwtAccessPayload } from "../utils/jwt";

declare module "fastify" {
    interface FastifyRequest {
        jwtUser?: JwtAccessPayload;
    }
}

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
        await req.accessJwtVerify();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        req.jwtUser = req.access!;
    } catch {
        reply.code(401).send({ message: "Token inválido ou expirado" });
    }
}

export async function adminMiddleware(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    await authMiddleware(req, reply);
    if (reply.sent) return;
    if (req.jwtUser?.role !== "admin") {
        reply.code(403).send({ message: "Acesso restrito a administradores" });
    }
}
