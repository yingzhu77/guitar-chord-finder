import { noteName, normalizePitchClass, parseNoteName, type PitchClass } from "./notes";

export const CUSTOM_TUNING_ID = "custom";

export interface TuningString {
  stringNumber: number;
  pitchClass: PitchClass;
  midi: number;
}

export interface TuningPreset {
  id: string;
  name: string;
  description: string;
  strings: TuningString[];
}

const STANDARD_MIDI = [40, 45, 50, 55, 59, 64];

function makeString(stringNumber: number, note: string, midi: number): TuningString {
  const pitchClass = parseNoteName(note);
  if (pitchClass === null) {
    throw new Error(`Invalid tuning note: ${note}`);
  }

  return {
    stringNumber,
    pitchClass,
    midi,
  };
}

function makeTuning(id: string, name: string, description: string, notes: string[], midi: number[]): TuningPreset {
  return {
    id,
    name,
    description,
    strings: notes.map((note, index) => makeString(6 - index, note, midi[index])),
  };
}

export const TUNING_PRESETS: TuningPreset[] = [
  makeTuning("standard", "Standard", "E A D G B e", ["E", "A", "D", "G", "B", "E"], STANDARD_MIDI),
  makeTuning("drop-d", "Drop D", "D A D G B e", ["D", "A", "D", "G", "B", "E"], [38, 45, 50, 55, 59, 64]),
  makeTuning("half-step-down", "Half Step Down", "Eb Ab Db Gb Bb Eb", ["EB", "AB", "DB", "GB", "BB", "EB"], [39, 44, 49, 54, 58, 63]),
  makeTuning("dadgad", "DADGAD", "D A D G A D", ["D", "A", "D", "G", "A", "D"], [38, 45, 50, 55, 57, 62]),
  makeTuning("open-g", "Open G", "D G D G B D", ["D", "G", "D", "G", "B", "D"], [38, 43, 50, 55, 59, 62]),
];

export function cloneTuning(tuning: TuningPreset): TuningPreset {
  return {
    ...tuning,
    strings: tuning.strings.map((string) => ({ ...string })),
  };
}

export function getPresetById(id: string): TuningPreset | undefined {
  return TUNING_PRESETS.find((preset) => preset.id === id);
}

export function createDefaultCustomTuning(): TuningPreset {
  const standard = cloneTuning(TUNING_PRESETS[0]);
  return {
    ...standard,
    id: CUSTOM_TUNING_ID,
    name: "Custom",
    description: standard.strings.map((string) => noteName(string.pitchClass)).join(" "),
  };
}

export function updateCustomString(tuning: TuningPreset, stringIndex: number, pitchClass: PitchClass): TuningPreset {
  const next = cloneTuning(tuning);
  const string = next.strings[stringIndex];
  if (!string) {
    return next;
  }

  const currentPitch = string.pitchClass;
  const semitoneShift = normalizePitchClass(pitchClass - currentPitch);
  const shortestShift = semitoneShift > 6 ? semitoneShift - 12 : semitoneShift;
  next.strings[stringIndex] = {
    ...string,
    pitchClass,
    midi: string.midi + shortestShift,
  };
  next.description = next.strings.map((item) => noteName(item.pitchClass)).join(" ");
  return next;
}

export function isValidTuning(tuning: unknown): tuning is TuningPreset {
  if (!tuning || typeof tuning !== "object") {
    return false;
  }

  const candidate = tuning as TuningPreset;
  return Array.isArray(candidate.strings) && candidate.strings.length === 6;
}
