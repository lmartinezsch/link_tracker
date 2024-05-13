import * as crypto from 'crypto';

export const generateRandomBytes = (size: number) => {
  const randomBytes = crypto.randomBytes(size);
  return randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};
