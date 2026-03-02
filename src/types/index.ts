export enum UserRole {
  SUPER_ADMIN = "super_admin",
  SELLER = "seller",
  TRANSPORTER = "transporter",
}

export enum LoadStatus {
  AVAILABLE = "available",
  ACCEPTED = "accepted",
  COMPLETED = "completed",
}

export enum NotificationType {
  LOAD_ACCEPTED = "load_accepted",
  LOAD_COMPLETED = "load_completed",
  GENERAL = "general",
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  mobile: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}
