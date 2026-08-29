// Replaces the old multer-based `middleware/uploadMiddleware.js`. Route
// Handlers parse `multipart/form-data` natively via `request.formData()`,
// so instead of Express middleware this is a couple of small helpers that
// pull File(s) out of a FormData object and apply the exact same validation
// multer used to (image mimetype/extension, 5MB limit).

const ALLOWED_EXTENSION_PATTERN = /\.(jpeg|jpg|png|webp)$/i;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, same as the old multer limit

export interface ParsedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

function isValidImage(file: File): boolean {
  const isValidExtension = ALLOWED_EXTENSION_PATTERN.test(file.name);
  return file.type.startsWith('image/') || isValidExtension;
}

async function toParsedFile(file: File): Promise<ParsedFile> {
  if (!isValidImage(file)) {
    throw new Error('Only image files are allowed');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  const arrayBuffer = await file.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    originalname: file.name,
    mimetype: file.type,
  };
}

export async function parseSingleImage(formData: FormData, field: string): Promise<ParsedFile | null> {
  const value = formData.get(field);
  if (!value || !(value instanceof File) || value.size === 0) return null;
  return toParsedFile(value);
}

export async function parseMultipleImages(
  formData: FormData,
  field: string,
  maxCount = 5
): Promise<ParsedFile[]> {
  const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length > maxCount) {
    throw new Error(`Too many files uploaded, max is ${maxCount}`);
  }

  const parsed: ParsedFile[] = [];
  for (const file of files) {
    parsed.push(await toParsedFile(file));
  }
  return parsed;
}
