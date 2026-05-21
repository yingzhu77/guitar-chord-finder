export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface NoteOption {
  pitchClass: PitchClass;
  label: string;
  shortLabel: string;
  aliases: string[];
}

export const NOTE_OPTIONS: NoteOption[] = [
  { pitchClass: 0, label: "C", shortLabel: "C", aliases: ["C", "B#"] },
  { pitchClass: 1, label: "C#/Db", shortLabel: "C#", aliases: ["C#", "DB"] },
  { pitchClass: 2, label: "D", shortLabel: "D", aliases: ["D"] },
  { pitchClass: 3, label: "D#/Eb", shortLabel: "D#", aliases: ["D#", "EB"] },
  { pitchClass: 4, label: "E", shortLabel: "E", aliases: ["E", "FB"] },
  { pitchClass: 5, label: "F", shortLabel: "F", aliases: ["F", "E#"] },
  { pitchClass: 6, label: "F#/Gb", shortLabel: "F#", aliases: ["F#", "GB"] },
  { pitchClass: 7, label: "G", shortLabel: "G", aliases: ["G"] },
  { pitchClass: 8, label: "G#/Ab", shortLabel: "G#", aliases: ["G#", "AB"] },
  { pitchClass: 9, label: "A", shortLabel: "A", aliases: ["A"] },
  { pitchClass: 10, label: "A#/Bb", shortLabel: "A#", aliases: ["A#", "BB"] },
  { pitchClass: 11, label: "B", shortLabel: "B", aliases: ["B", "CB"] },
];

const NOTE_BY_ALIAS = NOTE_OPTIONS.reduce<Record<string, PitchClass>>((map, note) => {
  note.aliases.forEach((alias) => {
    map[alias] = note.pitchClass;
  });
  return map;
}, {});

export function normalizePitchClass(value: number): PitchClass {
  return (((value % 12) + 12) % 12) as PitchClass;
}

export function noteName(pitchClass: PitchClass): string {
  return NOTE_OPTIONS[pitchClass].label;
}

export function shortNoteName(pitchClass: PitchClass): string {
  return NOTE_OPTIONS[pitchClass].shortLabel;
}

export function parseNoteName(input: string): PitchClass | null {
  const normalized = input.trim().replace("♯", "#").replace("♭", "B").toUpperCase();
  return NOTE_BY_ALIAS[normalized] ?? null;
}
