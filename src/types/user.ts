import { FastifyReply, FastifyRequest } from "fastify";

export type Role = "admin" | "user";

export interface User {
    id: number;
    username: string;
    role: Role;
    password: string; // hash, nunca senha pura
    averageHourlyRate: number;
    totalHours: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserCreate {
    username: string;
    password: string;
    averageHourlyRate?: number; 
}

export interface UserLoginOutput {
    id: number;
    username: string;
    role: Role; // campo para diferenciar tipos de usuários (ex: admin, user)
    averageHourlyRate: number; // valor médio por hora para cálculo de saldo em dinheiro
    totalHours: number; // total de horas acumuladas (para referência, não é o saldo atual)
}

export interface UserSaldo {
    totalHours: number;
    averageHourlyRate: number;
}

export interface IUserRepository {
    createUser(user: UserCreate): Promise<User>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserById(id: number): Promise<User | null>;
    updateAverageHourlyRate(userId: number, newRate: number): Promise<void>;
    updateTotalHours(userId: number, hoursDelta: number): Promise<void>;
}

export interface IAuthService {
    register(user: UserCreate): Promise<UserLoginOutput>;
    login(username: string, password: string): Promise<UserLoginOutput>;
}

export interface IUserService {
    getSaldo(userId: number): Promise<UserSaldo>;
}

export interface IAuthController {
    register(req: FastifyRequest, reply: FastifyReply): Promise<void>;
    login(req: FastifyRequest, reply: FastifyReply): Promise<void>;
    refresh(req: FastifyRequest, reply: FastifyReply): Promise<void>;
}

export interface IUserController {
    getSaldo(req: FastifyRequest, reply: FastifyReply): Promise<void>;
}