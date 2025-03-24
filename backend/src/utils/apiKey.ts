import crypto from 'crypto';

export const generateApiKey = (): string => {
  return `lk_${crypto.randomBytes(32).toString('hex')}`;
}; 