import { db } from "../database/db";
import { IWorkEntriesRepository, WorkEntries, WorkEntriesCreate, WorkEntriesUpdate } from "../types/workEntries";

function mapRowToWorkEntries(row: any): WorkEntries {
    return {
        id: row.id,
        userId: row.user_id,
        date: row.date,
        hours: row.hours,
        amount: row.amount,
        description: row.description ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export class WorkEntriesRepository implements IWorkEntriesRepository {
    async createWorkEntries(entry: WorkEntriesCreate): Promise<WorkEntries> {
        const insert = db.prepare(
            `INSERT INTO work_entries (user_id, date, hours, amount, description) VALUES (?, ?, ?, ?, ?)`
        );
        const info = insert.run(entry.userId, entry.date, entry.hours, entry.amount ?? 0, entry.description ?? null);
        const row = db.prepare(`SELECT * FROM work_entries WHERE id = ?`).get(info.lastInsertRowid);
        return mapRowToWorkEntries(row);
    }

    async getTimeEntriesByUserId(userId: number): Promise<WorkEntries[]> {
        const rows = db.prepare(`SELECT * FROM work_entries WHERE user_id = ? ORDER BY date DESC`).all(userId);
        return rows.map(mapRowToWorkEntries);
    }

    async getWorkEntriesById(id: number): Promise<WorkEntries | null> {
        const row = db.prepare(`SELECT * FROM work_entries WHERE id = ?`).get(id);
        if (!row) return null;
        return mapRowToWorkEntries(row);
    }

    async updateWorkEntries(entry: WorkEntriesUpdate): Promise<WorkEntries> {
        const row = db.prepare(`UPDATE work_entries SET date = COALESCE(?, date), hours = COALESCE(?, hours), amount = COALESCE(?, amount), description = COALESCE(?, description) WHERE id = ? RETURNING *`)
            .get(entry.date, entry.hours, entry.amount, entry.description ?? null, entry.id);
        return mapRowToWorkEntries(row);
    }

    async deleteWorkEntries(id: number, userId: number): Promise<void> {
        db.prepare(`DELETE FROM work_entries WHERE id = ? AND user_id = ?`).run(id, userId);
    }
}
