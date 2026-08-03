import { BadRequestException } from '@nestjs/common';

export interface CursorPayload {
  createdAt: Date;
  id: string;
}

interface WireCursor {
  t: string;
  i: string;
}

//transform payload into string to put into URL
export function encodeCursor(row: CursorPayload): string {
  const wire: WireCursor = { t: row.createdAt.toISOString(), i: row.id };
  return Buffer.from(JSON.stringify(wire)).toString('base64url');
}

export function decodeCursor(raw: string): CursorPayload {
  let wire: unknown;

  try {
    wire = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    throw new BadRequestException('Invalid cursor');
  }

  if (
    typeof wire !== 'object' ||
    wire === null ||
    typeof (wire as WireCursor).t !== 'string' ||
    typeof (wire as WireCursor).i !== 'string'
  ) {
    throw new BadRequestException('Invalid cursor');
  }

  const createdAt = new Date((wire as WireCursor).t);

  if (Number.isNaN(createdAt.getTime())) {
    throw new BadRequestException('Invalid cursor');
  }

  return { createdAt, id: (wire as WireCursor).i };
}
