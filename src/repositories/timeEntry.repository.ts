import { db } from "../database/db";
import { ITimeEntryRepository, TimeEntry, TimeEntryCreate } from "../types/timeEntry";

function mapRowToTimeEntry(row: any): TimeEntry {
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

export class TimeEntryRepository implements ITimeEntryRepository {
    async createTimeEntry(entry: TimeEntryCreate): Promise<TimeEntry> {
        const insert = db.prepare(
            `INSERT INTO time_entries (user_id, date, hours, amount, description) VALUES (?, ?, ?, ?, ?)`
        );
        const info = insert.run(entry.userId, entry.date, entry.hours, entry.amount ?? 0, entry.description ?? null);
        const row = db.prepare(`SELECT * FROM time_entries WHERE id = ?`).get(info.lastInsertRowid);
        return mapRowToTimeEntry(row);
    }

    async getTimeEntriesByUserId(userId: number): Promise<TimeEntry[]> {
        const rows = db.prepare(`SELECT * FROM time_entries WHERE user_id = ? ORDER BY date DESC`).all(userId);
        return rows.map(mapRowToTimeEntry);
    }

    async getTimeEntryById(id: number): Promise<TimeEntry | null> {
        const row = db.prepare(`SELECT * FROM time_entries WHERE id = ?`).get(id);
        if (!row) return null;
        return mapRowToTimeEntry(row);
    }
}
