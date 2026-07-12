import crypto from 'crypto';

export function sha256Hex(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function sha256Bytes32(value: string) {
  return `0x${sha256Hex(value)}`;
}
