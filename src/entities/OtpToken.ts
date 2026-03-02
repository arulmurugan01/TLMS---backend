import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("otp_tokens")
export class OtpToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;


  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Index()
  @Column({ type: "uuid", nullable: true})
  userId!: string;

  @Index()
  @Column({ length: 15 })
  mobile!: string;

  @Column({ length: 6 })
  otp!: string;

  @Column({ type: "datetime" })
  expiresAt!: Date;

  @Column({ default: false })
  isUsed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
