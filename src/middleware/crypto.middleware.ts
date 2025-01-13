import * as crypto from 'crypto';

// Genera una contraseña aleatoria
export function generateRandomPassword(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex'); // Contraseña aleatoria con longitud configurable
}

// Hashea una contraseña de forma segura
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString('hex'); // Salt de 32 bytes
  const iterations = 310000; // Iteraciones según estándares modernos (310k recomendado por OWASP)
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex'); // Deriva el hash
  return `${salt}:${iterations}:${hash}`; // Formato: salt:iteraciones:hash
}

// Verifica una contraseña contra un hash almacenado
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, iterations, hash] = storedHash.split(':'); // Divide el salt, iteraciones y hash
  const computedHash = crypto
    .pbkdf2Sync(password, salt, parseInt(iterations, 10), 64, 'sha512')
    .toString('hex');
  return hash === computedHash; // Compara los hashes
}
