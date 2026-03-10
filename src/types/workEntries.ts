import { FastifyReply, FastifyRequest } from "fastify";

export interface WorkEntries {
    id: number;
    userId: number;
    date: string; // data do trabalho (YYYY-MM-DD)
    hours: number; // quantidade de horas trabalhadas
    amount: number; // valor recebido nessa entrada
    description?: string; // descrição opcional
    createdAt: string;
    updatedAt: string;
}

export interface WorkEntriesCreate {
    userId: number;
    date: string; // data do trabalho (YYYY-MM-DD)
    hours: number; // quantidade de horas trabalhadas
    amount?: number; // valor recebido nessa entrada (opcional, pode ser calculado a partir do averageHourlyRate do usuário)
    description?: string; // descrição opcional
}

export interface WorkEntriesUpdate {
    id: number; // id da entrada a ser atualizada
    date?: string; // data do trabalho (YYYY-MM-DD)
    hours?: number; // quantidade de horas trabalhadas
    amount?: number; // valor recebido nessa entrada
    description?: string; // descrição opcional
}

export interface WorkEntriesOutput {
    id: number;
    userId: number;
    date: string; // data do trabalho (YYYY-MM-DD)
    hours: number; // quantidade de horas trabalhadas
    amount: number; // valor recebido nessa entrada
    description?: string; // descrição opcional
    createdAt: string;
    updatedAt: string;
}

export interface IWorkEntriesRepository {
    createWorkEntries(entry: WorkEntriesCreate): Promise<WorkEntries>;
    getTimeEntriesByUserId(userId: number): Promise<WorkEntries[]>;
    getWorkEntriesById(id: number): Promise<WorkEntries | null>;
    updateWorkEntries(entry: WorkEntriesUpdate): Promise<WorkEntries>;
    deleteWorkEntries(id: number, userId: number): Promise<void>;
}

export interface IWorkEntriesService {
    addWorkEntries(entry: WorkEntriesCreate): Promise<WorkEntriesOutput>;
    listWorkEntries(userId: number): Promise<WorkEntriesOutput[]>;
    getWorkEntries(id: number, userId: number): Promise<WorkEntriesOutput | null>;
    updateWorkEntries(entry: WorkEntriesUpdate, userId: number): Promise<WorkEntriesOutput>;
    deleteWorkEntries(id: number, userId: number): Promise<void>;
}

export interface IWorkEntriesController {
    addWorkEntries(req: FastifyRequest, reply: FastifyReply): Promise<WorkEntriesOutput>;
    listTimeEntries(req: FastifyRequest, reply: FastifyReply): Promise<WorkEntriesOutput[]>;
    getWorkEntries(req: FastifyRequest, reply: FastifyReply): Promise<WorkEntriesOutput | null>;
    updateWorkEntries(req: FastifyRequest, reply: FastifyReply): Promise<WorkEntriesOutput | null>;
    deleteWorkEntries(req: FastifyRequest, reply: FastifyReply): Promise<void>;
}