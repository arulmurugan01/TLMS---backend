import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserRole } from "../types";
import { Load } from "./Load";
import { Notification } from "./Notification";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 15 })
  mobile!: string;

  @Column({ nullable: true, length: 100 })
  name!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.SELLER,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Load, (load) => load.seller)
  postedLoads!: Load[];

  @OneToMany(() => Load, (load) => load.driver)
  acceptedLoads!: Load[];

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications!: Notification[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
