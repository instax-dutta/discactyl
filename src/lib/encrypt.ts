import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(env.API_KEY_ENCRYPTION_SECRET, 'hex');

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encrypt(plaintext: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

export function decrypt(data: EncryptedData): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(data.iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

  let plaintext = decipher.update(data.encrypted, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}
