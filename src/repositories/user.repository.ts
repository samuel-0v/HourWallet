import { db } from "../database/db";
import { IUserRepository, User, UserCreate } from "../types/user";

function mapRowToUser(row: any): User {
    return {
        id: row.id,
        username: row.username,
        role: row.role,
        password: row.password,
        averageHourlyRate: row.average_hourly_rate ?? 0,
        totalHours: row.total_hours ?? 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export class UserRepository implements IUserRepository {
    async createUser(user: UserCreate): Promise<User> {
        const insert = db.prepare(
            `INSERT INTO users (username, password, average_hourly_rate) VALUES (?, ?, ?)`
        );
        const info = insert.run(user.username, user.password, user.averageHourlyRate ?? 0);
        const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(info.lastInsertRowid);
        return mapRowToUser(row);
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const row = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
        if (!row) return null;
        return mapRowToUser(row);
    }

    async getUserById(id: number): Promise<User | null> {
        const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
        if (!row) return null;
        return mapRowToUser(row);
    }

    async updateAverageHourlyRate(userId: number, newRate: number): Promise<void> {
        db.prepare(`UPDATE users SET average_hourly_rate = ? WHERE id = ?`).run(newRate, userId);
    }

    async updateTotalHours(userId: number, hoursDelta: number): Promise<void> {
        db.prepare(`UPDATE users SET total_hours = total_hours + ? WHERE id = ?`).run(hoursDelta, userId);
    }
}
