import { AppDataSource } from "../config/database";
import { Load } from "../entities/Load";
import { User } from "../entities/User";
import { LoadStatus, NotificationType, UserRole } from "../types";
import { NotificationService } from "./notification.service";

const loadRepo = () => AppDataSource.getRepository(Load);
const userRepo = () => AppDataSource.getRepository(User);

export interface CreateLoadDto {
  origin: string;
  destination: string;
  materialDescription: string;
  weight: number;
  price: number;
  pickupDate: Date;
  notes?: string;
}

export interface LoadFilters {
  status?: LoadStatus;
  origin?: string;
  destination?: string;
  page?: number;
  limit?: number;
}

export class LoadService {

  static async create(sellerId: string, dto: CreateLoadDto): Promise<Load> {
    const load = loadRepo().create({
      ...dto,
      sellerId,
      status: LoadStatus.AVAILABLE,
      driverId: null,
    });
    return loadRepo().save(load);
  }

  static async getAvailable(filters: LoadFilters = {}): Promise<{
    loads: Load[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, origin, destination } = filters;

    const qb = loadRepo()
      .createQueryBuilder("load")
      .leftJoinAndSelect("load.seller", "seller")
      .where("load.status = :status", { status: LoadStatus.AVAILABLE });

    if (origin) {
      qb.andWhere("load.origin LIKE :origin", { origin: `%${origin}%` });
    }
    if (destination) {
      qb.andWhere("load.destination LIKE :destination", {
        destination: `%${destination}%`,
      });
    }

    qb.orderBy("load.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [loads, total] = await qb.getManyAndCount();

    const sanitized = loads.map((l) => ({
      ...l,
      seller: l.seller
        ? { id: l.seller.id, name: l.seller.name }
        : undefined,
    }));

    return {
      loads: sanitized as Load[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getByseller(
    sellerId: string,
    filters: LoadFilters = {}
  ): Promise<{ loads: Load[]; total: number }> {
    const { page = 1, limit = 10, status } = filters;

    const where: Record<string, unknown> = { sellerId };
    if (status) where["status"] = status;

    const [loads, total] = await loadRepo().findAndCount({
      where,
      relations: ["driver"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    console.log(loads);

    return { loads, total };
  }

  static async getByDriver(
    driverId: string,
    filters: LoadFilters = {}
  ): Promise<{ loads: Load[]; total: number }> {
    const { page = 1, limit = 10, status } = filters;

    const where: Record<string, unknown> = { driverId };
    if (status) where["status"] = status;

    const [loads, total] = await loadRepo().findAndCount({
      where,
      relations: ["seller"],
      order: { updatedAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { loads, total };
  }

  static async getById(
    loadId: string,
    requesterId: string,
    requesterRole: UserRole
  ): Promise<Load> {
    const load = await loadRepo().findOne({
      where: { id: loadId },
      relations: ["seller", "driver"],
    });

    if (!load) throw new Error("Load not found.");

    if (
      requesterRole === UserRole.SELLER &&
      load.sellerId !== requesterId
    ) {
      throw new Error("Access denied.");
    }

    if (
      requesterRole === UserRole.TRANSPORTER &&
      load.status === LoadStatus.AVAILABLE
    ) {
      load.seller = {
        ...load.seller,
        mobile: "hidden",
      } as User;
    }

    return load;
  }

  static async accept(loadId: string, driverId: string): Promise<Load> {
    const load = await loadRepo().findOne({
      where: { id: loadId },
      relations: ["seller"],
    });

    if (!load) throw new Error("Load not found.");
    if (load.status !== LoadStatus.AVAILABLE) {
      throw new Error("Load is no longer available.");
    }
    if (load.driverId) throw new Error("Load already assigned.");


    load.status = LoadStatus.ACCEPTED;
    load.driverId = driverId;
    const saved = await loadRepo().save(load);

    const driver = await userRepo().findOne({ where: { id: driverId } });

    await NotificationService.create({
      userId: load.sellerId,
      type: NotificationType.LOAD_ACCEPTED,
      title: "Your load has been accepted!",
      message: `Driver ${driver?.name || driver?.mobile || "A transporter"} has accepted your load from ${load.origin} to ${load.destination}.`,
      relatedLoadId: load.id,
    });

    return saved;
  }


  static async complete(
    loadId: string,
    requesterId: string,
    requesterRole: UserRole
  ): Promise<Load> {
    const load = await loadRepo().findOne({ where: { id: loadId } });
    if (!load) throw new Error("Load not found.");

    if (requesterRole === UserRole.SELLER && load.sellerId !== requesterId) {
      throw new Error("Access denied.");
    }

    if (load.status !== LoadStatus.ACCEPTED) {
      throw new Error("Only accepted loads can be marked as completed.");
    }

    load.status = LoadStatus.COMPLETED;
    const saved = await loadRepo().save(load);

    if (load.driverId) {
      await NotificationService.create({
        userId: load.driverId,
        type: NotificationType.LOAD_COMPLETED,
        title: "Load marked as completed",
        message: `The load from ${load.origin} to ${load.destination} has been marked as completed.`,
        relatedLoadId: load.id,
      });
    }

    return saved;
  }

  static async getAll(filters: LoadFilters = {}): Promise<{
    loads: Load[];
    total: number;
  }> {
    const { page = 1, limit = 10, status } = filters;

    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;

    const [loads, total] = await loadRepo().findAndCount({
      where,
      relations: ["seller", "driver"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { loads, total };
  }

  static async adminUpdate(
    loadId: string,
    data: Partial<CreateLoadDto> & { status?: LoadStatus }
  ): Promise<Load> {
    const load = await loadRepo().findOne({ where: { id: loadId } });
    if (!load) throw new Error("Load not found.");
    Object.assign(load, data);
    return loadRepo().save(load);
  }

  static async adminDelete(loadId: string): Promise<void> {
    const load = await loadRepo().findOne({ where: { id: loadId } });
    if (!load) throw new Error("Load not found.");
    await loadRepo().remove(load);
  }
}
