import crypto from "crypto"

// Hash password using Node.js crypto
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "salt", 1000, 64, "sha512").toString("hex")
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  const hashOfInput = hashPassword(password)
  return hashOfInput === hash
}

// Generate verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// User types
export type UserType = "admin" | "user"

export interface User {
  id: string
  email: string
  full_name: string
  user_type: UserType
  is_verified: boolean
}
