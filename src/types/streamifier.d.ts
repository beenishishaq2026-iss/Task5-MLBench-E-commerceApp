declare module 'streamifier' {
  import { Readable } from 'stream';
  export function createReadStream(buffer: Buffer | string, options?: Record<string, unknown>): Readable;
}
