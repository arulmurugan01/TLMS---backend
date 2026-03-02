import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { UserRole } from "../types";

const userRepo = () => AppDataSource.getRepository(User);

export class AdminService {
  static async getAllUsers(page = 1, limit = 20): Promise<{
    users: Partial<User>[];
    total: number;
  }> {
    const [users, total] = await userRepo().findAndCount({
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
      select: ["id", "mobile", "name", "role", "isActive", "createdAt"],
    });
    return { users, total };
  }

  static async getUserById(userId: string): Promise<User> {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found.");
    return user;
  }

  static async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found.");
    user.role = role;
    return userRepo().save(user);
  }

  static async toggleUserStatus(userId: string): Promise<User> {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found.");
    user.isActive = !user.isActive;
    return userRepo().save(user);
  }

  static async deleteUser(userId: string): Promise<void> {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found.");
    await userRepo().remove(user);
  }

  static async getStats(): Promise<Record<string, number>> {
    const { Load } = await import("../entities/Load");
    const { LoadStatus } = await import("../types");

    const loadRepo = AppDataSource.getRepository(Load);

    const [totalUsers, totalSellers, totalTransporters] = await Promise.all([
      userRepo().count(),
      userRepo().count({ where: { role: UserRole.SELLER } }),
      userRepo().count({ where: { role: UserRole.TRANSPORTER } }),
    ]);

    const [totalLoads, available, accepted, completed] = await Promise.all([
      loadRepo.count(),
      loadRepo.count({ where: { status: LoadStatus.AVAILABLE } }),
      loadRepo.count({ where: { status: LoadStatus.ACCEPTED } }),
      loadRepo.count({ where: { status: LoadStatus.COMPLETED } }),
    ]);

    return {
      totalUsers,
      totalSellers,
      totalTransporters,
      totalLoads,
      availableLoads: available,
      acceptedLoads: accepted,
      completedLoads: completed,
    };
  }
}
