import { BadRequestException } from '@nestjs/common';
import { decodeCursor, encodeCursor } from './cursor';

describe('cursor', () => {
  const row = {
    createdAt: new Date('2026-01-15T10:30:00.000Z'),
    id: 'a3f1c2d4-0000-4000-8000-000000000001',
  };

  it('round-trips a row', () => {
    const decoded = decodeCursor(encodeCursor(row));

    expect(decoded.id).toBe(row.id);
    expect(decoded.createdAt.toISOString()).toBe(row.createdAt.toISOString());
  });

  it('produces a url-safe string', () => {
    expect(encodeCursor(row)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('rejects a non-base64 string', () => {
    expect(() => decodeCursor('not a cursor!!')).toThrow(BadRequestException);
  });

  it('rejects valid base64 that is not cursor-shaped', () => {
    const junk = Buffer.from(JSON.stringify({ nope: true })).toString(
      'base64url',
    );

    expect(() => decodeCursor(junk)).toThrow(BadRequestException);
  });

  it('rejects a cursor carrying an invalid date', () => {
    const bad = Buffer.from(JSON.stringify({ t: 'never', i: row.id })).toString(
      'base64url',
    );

    expect(() => decodeCursor(bad)).toThrow(BadRequestException);
  });
});
