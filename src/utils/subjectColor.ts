import type { Subject } from '@/types';

const SUBJECT_COLOR_PALETTE = [
  'oklch(0.55 0.18 293)',
  'oklch(0.58 0.16 200)',
  'oklch(0.62 0.17 145)',
  'oklch(0.58 0.19 25)',
  'oklch(0.55 0.15 320)',
  'oklch(0.6 0.14 85)',
  'oklch(0.52 0.14 250)',
  'oklch(0.58 0.12 170)',
  'oklch(0.56 0.17 55)',
  'oklch(0.54 0.16 10)',
] as const;

function hashSubjectId(id: string): number {
  let hash = 0;

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getSubjectColorFromId(id: string): string {
  return SUBJECT_COLOR_PALETTE[hashSubjectId(id) % SUBJECT_COLOR_PALETTE.length];
}

export function generateRandomSubjectColor(usedColors: string[] = []): string {
  const available = SUBJECT_COLOR_PALETTE.filter((color) => !usedColors.includes(color));
  const pool = available.length > 0 ? available : SUBJECT_COLOR_PALETTE;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getSubjectColor(subject: Pick<Subject, 'id' | 'color'> | undefined): string {
  if (!subject) {
    return 'oklch(0.45 0.02 293)';
  }

  return subject.color ?? getSubjectColorFromId(subject.id);
}
