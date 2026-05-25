export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address.';
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username.trim()) return 'Username is required.';
  if (username.length < 3) return 'Username must be at least 3 characters.';
  if (username.length > 20) return 'Username must be 20 characters or fewer.';
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username may only contain letters, numbers, underscores, and hyphens.';
  return null;
}

export interface PasswordStrength {
  score: number; // 0-4
  missing: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const missing: string[] = [];
  if (password.length < 12) missing.push('At least 12 characters');
  if (!/[A-Z]/.test(password)) missing.push('One uppercase letter');
  if (!/[a-z]/.test(password)) missing.push('One lowercase letter');
  if (!/[0-9]/.test(password)) missing.push('One number');
  if (!/[!@#$%^&*]/.test(password)) missing.push('One special character (!@#$%^&*)');
  return { score: 5 - missing.length, missing };
}

export function validatePassword(password: string): string | null {
  const { missing } = checkPasswordStrength(password);
  if (missing.length > 0) return `Password must include: ${missing.join(', ')}.`;
  return null;
}

export function validateIdentifier(value: string): string | null {
  if (!value.trim()) return 'Email or username is required.';
  return null;
}
