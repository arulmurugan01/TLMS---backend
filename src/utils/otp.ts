/**
 * OTP Utility - Mock implementation
 * In production, replace sendOtp() with a real SMS provider (e.g. Twilio, MSG91)
 */

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOtpExpiry = (): Date => {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "5");
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
  return expiry;
};

export const sendOtp = async (mobile: string, otp: string): Promise<void> => {
  if (process.env.NODE_ENV === "development") {
    console.log("\n========================================");
    console.log(`  OTP for ${mobile}: ${otp}`);
    console.log("========================================\n");
  }
};

export const isOtpExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
