import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);
export const verifyPassword = async (plain: string, hash: string) => bcrypt.compare(plain, hash);

export const normalizeEmail = (email?: string) => {
  if (!email) return undefined;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length ? trimmed : undefined;
};
