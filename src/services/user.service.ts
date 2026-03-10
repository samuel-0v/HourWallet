import bcrypt from "bcrypt";
import { IUserService, IUserRepository, UserSaldo } from "../types/user";



export class UserService implements IUserService {
    private repo: IUserRepository;

    constructor(repo: IUserRepository) {
        this.repo = repo;
    }

    async getSaldo(userId: number): Promise<UserSaldo> {
        const user = await this.repo.getUserById(userId);
        if (!user) throw new Error("User not found");
        const averageHourlyRate = user.averageHourlyRate;
        return { totalHours: user.totalHours, averageHourlyRate };
    }
}
