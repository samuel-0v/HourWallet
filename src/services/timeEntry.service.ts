import { ITimeEntryService, ITimeEntryRepository, TimeEntryCreate, TimeEntryOutput } from "../types/timeEntry";

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

    constructor(repo: ITimeEntryRepository) {
        this.repo = repo;
    }

    async addTimeEntry(entry: TimeEntryCreate): Promise<TimeEntryOutput> {
        const created = await this.repo.createTimeEntry(entry);
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
