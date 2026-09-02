export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/;
  if (!specialCharRegex.test(password)) {
    return "Password must include at least one special character";
  }
  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}