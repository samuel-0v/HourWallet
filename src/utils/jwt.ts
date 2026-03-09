/** Configuração de JWT — segredos lidos das variáveis de ambiente. */
export const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  ?? "hw_access_secret_change_me_in_production";
export const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "hw_refresh_secret_change_me_in_production";

export interface JwtAccessPayload {
    sub: number;
    username: string;
    role: string;
}

export interface JwtRefreshPayload {
    sub: number;
    username: string;
    role: string;
}

/**
 * Augmentação de tipos do Fastify para os dois namespaces JWT
 * adicionados por @fastify/jwt (access + refresh).
 */
declare module "fastify" {
    interface FastifyRequest {
        /** Payload decodificado após accessJwtVerify() */
        access?: JwtAccessPayload;
        /** Payload decodificado após refreshJwtVerify() */
        refresh?: JwtRefreshPayload;
        accessJwtVerify(): Promise<void>;
        refreshJwtVerify(): Promise<void>;
    }
    interface FastifyReply {
        accessJwtSign(payload: JwtAccessPayload, options?: object): Promise<string>;
        refreshJwtSign(payload: JwtRefreshPayload, options?: object): Promise<string>;
    }
}

