import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { LoadStatus } from "../types";
import { User } from "./User";

@Entity("loads")
export class Load {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 255 })
  origin!: string;

  @Column({ length: 255 })
  destination!: string;

  @Column({ length: 500 })
  materialDescription!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  weight!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  price!: number;

  @Column({ type: "date" })
  pickupDate!: Date;

  @Column({
    type: "enum",
    enum: LoadStatus,
    default: LoadStatus.AVAILABLE,
  })
  status!: LoadStatus;

  

  // Seller relationship
  @Column()
  sellerId!: string;

  @ManyToOne(() => User, (user) => user.postedLoads, { eager: false })
  @JoinColumn({ name: "sellerId" })
  seller!: User;

  // Driver relationship (nullable until accepted)
  @Column({ nullable: true })
  driverId!: string | null;

  @ManyToOne(() => User, (user) => user.acceptedLoads, {
    nullable: true,
    eager: false,
  })
  
  @JoinColumn({ name: "driverId" })
  driver!: User | null;



  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
