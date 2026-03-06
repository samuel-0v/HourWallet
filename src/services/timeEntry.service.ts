import { ITimeEntryService, ITimeEntryRepository, TimeEntryCreate, TimeEntryOutput } from "../types/timeEntry";
import { IAuthRepository } from "../types/user";

function toOutput(t: any): TimeEntryOutput {
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

export class TimeEntryService implements ITimeEntryService {
    private repo: ITimeEntryRepository;
    private repoUser: IAuthRepository;

    constructor(repo: ITimeEntryRepository, repoUser: IAuthRepository) {
        this.repo = repo;
        this.repoUser = repoUser;
    }

    async addTimeEntry(entry: TimeEntryCreate): Promise<TimeEntryOutput> {
        const user = await this.repoUser.getUserById(entry.userId);
        if (!user) throw new Error("User not found");
        
        const amount = entry.amount ?? user.averageHourlyRate * entry.hours;
        const entryToCreate = { ...entry, amount };

        const created = await this.repo.createTimeEntry(entryToCreate);
        await this.repoUser.updateTotalHours(entry.userId, entry.hours + user.totalHours);
        if (entry.amount) {
            const newAverage = (user.averageHourlyRate * user.totalHours + amount) / (user.totalHours + entry.hours);
            await this.repoUser.updateAverageHourlyRate(entry.userId, newAverage);
        }
        return toOutput(created);
    }

    async listTimeEntries(userId: number): Promise<TimeEntryOutput[]> {
        const rows = await this.repo.getTimeEntriesByUserId(userId);
        return rows.map(toOutput);
    }

    async getTimeEntry(id: number): Promise<TimeEntryOutput | null> {
        const row = await this.repo.getTimeEntryById(id);
        if (!row) return null;
        return toOutput(row);
    }
}
