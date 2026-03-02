import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { OtpToken } from "../entities/OtpToken";
import { UserRole } from "../types";
import { generateOtp, getOtpExpiry, sendOtp, isOtpExpired } from "../utils/otp";
import { generateToken } from "../utils/jwt";
import { Not } from "typeorm";

const userRepo = () => AppDataSource.getRepository(User);
const otpRepo = () => AppDataSource.getRepository(OtpToken);

export class AuthService {

  static async requestOtp(
    mobile: string,
    role?: UserRole,
    name?: UserRole
  ): Promise<{ message: string }> {
    
    let whereCondition: any = { mobile };

    if (role) {
      whereCondition.role = Not(role); 
    }

    const existingUser = await userRepo().findOne({ where: whereCondition });

    if (existingUser) {
      throw new Error('Number already exists in another role');
    }


    const whereCondition2: any = { mobile };

    const existingUser2 = await userRepo().findOne({
      where: {
        ...whereCondition2,
        name: Not(name),
      },
    });

    if (existingUser2) {
      throw new Error('The mobile number exists but the user name is incorrect');
    }
  
    let user = await userRepo().findOne({ where: { mobile, role } });

    if (!user) {
      user = userRepo().create({
        mobile,
        role: role || UserRole.SELLER,
        name: name
      });
      await userRepo().save(user);
    }

    const otpChek = await otpRepo().findOne({
      where: { userId: user.id, mobile, isUsed: false },
      order: { createdAt: "DESC" },
    });

    if (otpChek) {
      await otpRepo().update(
        { id: otpChek.id },
        { isUsed: true }
      );
    }

    const otp = generateOtp();
    const otpToken = otpRepo().create({
      userId: user.id,
      mobile,
      otp,
      expiresAt: getOtpExpiry(),
    });

    await otpRepo().save(otpToken);

    await sendOtp(mobile, otp);

    return { message: "OTP sent successfully." };
  }


  static async verifyOtp(
    mobile: string,
    otp: string
  ): Promise<{ token: string; user: Partial<User> }> {

    const otpToken = await otpRepo().findOne({
      where: { mobile, otp, isUsed: false },
      order: { createdAt: "DESC" },
    });

    if (!otpToken) {
      throw new Error("Invalid OTP.");
    }

    if (isOtpExpired(otpToken.expiresAt)) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    otpToken.isUsed = true;
    await otpRepo().save(otpToken);

    const user = await userRepo().findOne({ where: { mobile } });
    if (!user || !user.isActive) {
      throw new Error("Account not found or deactivated.");
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      mobile: user.mobile,
    });

    return {
      token,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
      },
    };
  }


  static async getProfile(userId: string): Promise<User> {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found.");
    return user;
  }


  static async updateProfile(
    userId: string,
    data: { name?: string }
  ): Promise<User> {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found.");
    if (data.name) user.name = data.name;
    return userRepo().save(user);
  }
}
