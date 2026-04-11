/* eslint-disable prettier/prettier */
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 6  
    })
    return hashedPassword;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const comparePassword = async (hash: string, password: string) => {
  try {
    return await argon2.verify(hash, password)
  } catch (error) {
    throw error;
  }
};

export const hashOTP = async (otp: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = bcrypt.hashSync(otp, salt);
    return hashedOTP;
  } catch (error: any) {
    throw new Error(error.message);
  }
};