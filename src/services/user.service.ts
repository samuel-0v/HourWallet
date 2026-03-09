import bcrypt from "bcrypt";
import { IUserService, IUserRepository } from "../types/user";



export class UserService implements IUserService {
    private repo: IUserRepository;

    constructor(repo: IUserRepository) {
        this.repo = repo;
    }

    async getSaldo(userId: number): Promise<{ totalHours: number; totalAmount: number }> {
        const user = await this.repo.getUserById(userId);
        if (!user) throw new Error("User not found");
        const totalAmount = user.totalHours * user.averageHourlyRate;
        return { totalHours: user.totalHours, totalAmount };
    }
}
