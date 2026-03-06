import { FastifyReply, FastifyRequest } from "fastify";

export interface TimeEntry {
    id: number;
    userId: number;
    date: string; // data do trabalho (YYYY-MM-DD)
    hours: number; // quantidade de horas trabalhadas
    amount: number; // valor recebido nessa entrada
    description?: string; // descrição opcional
    createdAt: string;
    updatedAt: string;
}

export interface TimeEntryCreate {
    userId: number;
    date: string; // data do trabalho (YYYY-MM-DD)
    hours: number; // quantidade de horas trabalhadas
    amount: number; // valor recebido nessa entrada (opcional, pode ser calculado a partir do averageHourlyRate do usuário)
    description?: string; // descrição opcional
}

export interface TimeEntryOutput {
    id: number;
    userId: number;
    date: string; // data do trabalho (YYYY-MM-DD)
    hours: number; // quantidade de horas trabalhadas
    amount: number; // valor recebido nessa entrada
    description?: string; // descrição opcional
    createdAt: string;
    updatedAt: string;
}

export interface ITimeEntryRepository {
    createTimeEntry(entry: TimeEntryCreate): Promise<TimeEntry>;
    getTimeEntriesByUserId(userId: number): Promise<TimeEntry[]>;
    getTimeEntryById(id: number): Promise<TimeEntry | null>;
}

export interface ITimeEntryService {
    addTimeEntry(entry: TimeEntryCreate): Promise<TimeEntryOutput>;
    listTimeEntries(userId: number): Promise<TimeEntryOutput[]>;
    getTimeEntry(id: number): Promise<TimeEntryOutput | null>;
}

export interface ITimeEntryController {
    addTimeEntry(req: FastifyRequest, reply: FastifyReply): Promise<TimeEntryOutput>;
    listTimeEntries(req: FastifyRequest, reply: FastifyReply): Promise<TimeEntryOutput[]>;
    getTimeEntry(req: FastifyRequest, reply: FastifyReply): Promise<TimeEntryOutput | null>;
}