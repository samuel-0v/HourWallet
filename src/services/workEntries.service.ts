import { IWorkEntriesService, IWorkEntriesRepository, WorkEntriesCreate, WorkEntriesOutput } from "../types/workEntries";
import { IUserRepository } from "../types/user";

function toOutput(t: any): WorkEntriesOutput {
    return {
        id: t.id,
        userId: t.userId,
        date: t.date,
        hours: t.hours,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
    };
}

export class WorkEntriesService implements IWorkEntriesService {
    private repo: IWorkEntriesRepository;
    private repoUser: IUserRepository;

    constructor(repo: IWorkEntriesRepository, repoUser: IUserRepository) {
        this.repo = repo;
        this.repoUser = repoUser;
    }

    async addWorkEntries(entry: WorkEntriesCreate): Promise<WorkEntriesOutput> {
        const user = await this.repoUser.getUserById(entry.userId);
        if (!user) throw new Error("User not found");

        if( entry.amount === undefined && user.averageHourlyRate === 0) {
            throw new Error("Amount is required when average hourly rate is not set");
        }

        const amount = entry.amount ?? user.averageHourlyRate * entry.hours;
        const entryToCreate = { ...entry, amount };

        const created = await this.repo.createWorkEntries(entryToCreate);
        await this.repoUser.updateTotalHours(entry.userId, entry.hours);
        if (entry.amount) {
            const newAverage = (user.averageHourlyRate * user.totalHours + amount) / (user.totalHours + entry.hours);
            await this.repoUser.updateAverageHourlyRate(entry.userId, newAverage);
        }
        return toOutput(created);
    }

    async listWorkEntries(userId: number): Promise<WorkEntriesOutput[]> {
        const rows = await this.repo.getTimeEntriesByUserId(userId);
        return rows.map(toOutput);
    }

    async getWorkEntries(id: number): Promise<WorkEntriesOutput | null> {
        const row = await this.repo.getWorkEntriesById(id);
        if (!row) return null;
        return toOutput(row);
    }

    async deleteWorkEntries(id: number, userId: number): Promise<void> {
        const entry = await this.repo.getWorkEntriesById(id);
        if (!entry) throw new Error("Time entry not found");
        if (entry.userId !== userId) throw new Error("Unauthorized");

        const user = await this.repoUser.getUserById(userId);
        if (!user) throw new Error("User not found");

        const newAverage = user.totalHours - entry.hours > 0 ? (user.averageHourlyRate * user.totalHours - entry.amount) / (user.totalHours - entry.hours) : 0;
        
        await this.repo.deleteWorkEntries(id, userId);

        //junção de lógica para atualizar média e total de horas do usuário
        await this.repoUser.updateAverageHourlyRate(userId, newAverage);
        await this.repoUser.updateTotalHours(userId, -entry.hours);
    }
}
