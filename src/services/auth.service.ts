import bcrypt from "bcrypt";
import { IAuthService, IUserRepository, UserCreate, UserLoginOutput } from "../types/user";

function toUserLoginOutput(user: any): UserLoginOutput {
    return {
        id: user.id,
        username: user.username,
        role: user.role,
        averageHourlyRate: user.averageHourlyRate,
        totalHours: user.totalHours,
    };
}

export class AuthService implements IAuthService {
    private repo: IUserRepository;

    constructor(repo: IUserRepository) {
        this.repo = repo;
    }

    async register(user: UserCreate): Promise<UserLoginOutput> {
        const existing = await this.repo.getUserByUsername(user.username);
        if (existing) throw new Error("Username already exists");
        const hash = await bcrypt.hash(user.password, 10);
        const createData: any = { username: user.username, password: hash };
        if (user.averageHourlyRate !== undefined) createData.averageHourlyRate = user.averageHourlyRate;
        const created = await this.repo.createUser(createData);
        return toUserLoginOutput(created);
    }

    async login(username: string, password: string): Promise<UserLoginOutput> {
        const user = await this.repo.getUserByUsername(username);
        if (!user) throw new Error("Invalid credentials");
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new Error("Invalid credentials");
        return toUserLoginOutput(user);
    }
}
